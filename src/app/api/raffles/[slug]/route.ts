import { NextRequest, NextResponse } from 'next/server';
import { getRaffleBySlug, getRaffleStats } from '@/lib/db';

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

    const stats = await getRaffleStats(raffle.id);

    return NextResponse.json({
      success: true,
      raffle: {
        ...raffle,
        stats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener la rifa' },
      { status: 500 }
    );
  }
}
