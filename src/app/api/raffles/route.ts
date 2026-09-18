import { NextResponse } from 'next/server';
import { getAllRaffles, getRaffleStats } from '@/lib/db';

export async function GET() {
  try {
    const raffles = await getAllRaffles();
    // Attach current stats to each raffle
    const rafflesWithStats = await Promise.all(
      raffles.map(async (raffle) => {
        const stats = await getRaffleStats(raffle.id);
        return {
          ...raffle,
          stats,
        };
      })
    );

    return NextResponse.json({ success: true, raffles: rafflesWithStats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener rifas' },
      { status: 500 }
    );
  }
}
