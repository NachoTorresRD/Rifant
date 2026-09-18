import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { executeRaffleDraw } from '@/lib/db';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { raffleId } = await request.json();

    if (!raffleId) {
      return NextResponse.json({ success: false, error: 'raffleId es requerido' }, { status: 400 });
    }

    const result = await executeRaffleDraw(raffleId);

    return NextResponse.json({
      success: true,
      winner: result,
      message: '¡Ganador sorteado y registrado exitosamente!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
