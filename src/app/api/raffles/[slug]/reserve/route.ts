import { NextRequest, NextResponse } from 'next/server';
import { getRaffleBySlug, reserveTickets } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. IP Rate Limiting (Prevent automated bot flood)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 5, 60 * 1000); // Max 5 reservation attempts per minute
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Has superado el límite de intentos de reserva. Por favor espera ${rateLimit.resetInSeconds} segundos antes de intentar nuevamente.` 
        },
        { status: 429 }
      );
    }

    const { slug } = await context.params;
    const body = await request.json();
    const { 
      numbers, 
      customerName, 
      customerPhone, 
      customerCedula, 
      customerEmail,
      company_code, // Honeypot trap field
      formLoadedAt, // Timestamp when modal was opened
    } = body;

    // 2. Anti-Bot Honeypot Trap Check
    // If the invisible company_code field has any value, it was filled by an automated bot/scraper
    if (company_code && typeof company_code === 'string' && company_code.trim().length > 0) {
      // Quietly reject bot without giving hints
      return NextResponse.json(
        { success: false, error: 'Solicitud bloqueada por filtros de seguridad.' },
        { status: 400 }
      );
    }

    // 3. Time-to-Submit Timing Check (Human vs Bot velocity)
    // A real person takes at least 1.2s to open the modal, read fields and click submit
    if (formLoadedAt && typeof formLoadedAt === 'number') {
      const elapsedMs = Date.now() - formLoadedAt;
      if (elapsedMs < 1200) {
        return NextResponse.json(
          { success: false, error: 'Envío demasiado rápido. Por favor completa el formulario normalmente.' },
          { status: 400 }
        );
      }
    }

    // 4. Quantity Limit per Reservation (Prevent locking entire pool at once)
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes seleccionar al menos un número' },
        { status: 400 }
      );
    }

    if (numbers.length > 30) {
      return NextResponse.json(
        { success: false, error: 'Para garantizar oportunidades justas a todos, el límite es de máximo 30 boletos por pedido.' },
        { status: 400 }
      );
    }

    // 5. Customer Name Sanitization & Length
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa tu nombre completo (mínimo 3 caracteres)' },
        { status: 400 }
      );
    }

    if (customerName.trim().length > 70) {
      return NextResponse.json(
        { success: false, error: 'El nombre ingresado es demasiado largo' },
        { status: 400 }
      );
    }

    // 6. Phone Validation
    const cleanDigitsOnly = customerPhone ? customerPhone.replace(/[^0-9]/g, '') : '';
    if (!customerPhone || typeof customerPhone !== 'string' || cleanDigitsOnly.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa un número de teléfono o WhatsApp válido con al menos 8 dígitos' },
        { status: 400 }
      );
    }

    const raffle = await getRaffleBySlug(slug);
    if (!raffle) {
      return NextResponse.json(
        { success: false, error: 'Rifa no encontrada' },
        { status: 404 }
      );
    }

    // 7. Atomic backend reservation with combo discount calculation
    const { order, tickets, discount } = await reserveTickets({
      raffleId: raffle.id,
      numbers,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerCedula: customerCedula ? customerCedula.trim() : null,
      customerEmail: customerEmail ? customerEmail.trim() : null,
    });

    // Format WhatsApp message with Cédula and applied discount
    const formattedNumbers = numbers.join(', ');
    const totalFormatted = `${raffle.currency}${order.totalAmount.toLocaleString()}`;
    const cedulaText = customerCedula?.trim() ? `\nCédula: ${customerCedula.trim()}` : '';
    const discountText = discount > 0 ? `\n🔥 (Oferta aplicada - Ahorro: ${raffle.currency}${discount})` : '';

    const rawMessage = `Hola 👋 Quiero participar en la rifa de ${raffle.title}.\n\nMis números son:\n${formattedNumbers}\n\nTotal: ${totalFormatted}${discountText}\n\nMi nombre es: ${customerName.trim()}${cedulaText}`;
    
    // Clean organizer phone number for wa.me link
    const cleanPhone = raffle.organizerPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;

    return NextResponse.json({
      success: true,
      order,
      discount,
      ticketsCount: tickets.length,
      expiresAt: order.expiresAt,
      whatsappUrl,
      whatsappMessage: rawMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la reserva' },
      { status: 400 }
    );
  }
}

