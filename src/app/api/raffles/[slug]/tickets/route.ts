import { NextRequest, NextResponse } from 'next/server';
import { getRaffleBySlug, getRaffleTickets } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const raffle = await getRaffleBySlug(slug);

    if (!raffle) {
      return NextResponse.json(
        { success: false, error: 'Rifa no encontrada' },
        { status: 404 }
      );
    }

    const tickets = await getRaffleTickets(raffle.id);

    // For public safety, sanitize customer personal details when returning public tickets
    const sanitizedTickets = tickets.map((t) => ({
      id: t.id,
      number: t.number,
      status: t.status,
      // Only include firstName initial for sold numbers if desired, or keep anonymized
      isTaken: t.status !== 'AVAILABLE',
      reservationExpiresAt: t.reservationExpiresAt,
    }));

    return NextResponse.json({
      success: true,
      tickets: sanitizedTickets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener boletos' },
      { status: 500 }
    );
  }
}
