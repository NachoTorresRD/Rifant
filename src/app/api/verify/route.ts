import { NextRequest, NextResponse } from 'next/server';
import { verifyTicketNumber } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raffleIdOrSlug = searchParams.get('raffle');
  const number = searchParams.get('number');

  if (!raffleIdOrSlug || !number) {
    return NextResponse.json(
      { success: false, error: 'raffle y number son requeridos' },
      { status: 400 }
    );
  }

  try {
    const result = await verifyTicketNumber(raffleIdOrSlug, number);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Boleto o rifa no encontrados en el sistema' },
        { status: 404 }
      );
    }

    const { ticket, raffle } = result;

    // Mask sensitive details for public privacy
    const maskedPhone = ticket.customerPhone
      ? ticket.customerPhone.substring(0, 3) + '****' + ticket.customerPhone.slice(-3)
      : null;

    const maskedCedula = ticket.customerCedula
      ? ticket.customerCedula.substring(0, 4) + '*****' + ticket.customerCedula.slice(-2)
      : null;

    return NextResponse.json({
      success: true,
      ticket: {
        number: ticket.number,
        status: ticket.status,
        customerName: ticket.customerName,
        customerPhone: maskedPhone,
        customerCedula: maskedCedula,
        channel: ticket.channel || 'DIGITAL',
        updatedAt: ticket.updatedAt,
      },
      raffle: {
        id: raffle.id,
        title: raffle.title,
        pricePerTicket: raffle.pricePerTicket,
        currency: raffle.currency,
        drawDate: raffle.drawDate,
        drawTime: raffle.drawTime,
        status: raffle.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al verificar boleto' },
      { status: 500 }
    );
  }
}
