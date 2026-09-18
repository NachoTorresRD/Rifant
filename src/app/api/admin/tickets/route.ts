import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { getRaffleTickets, updateTicketStatus } from '@/lib/db';

export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raffleId = searchParams.get('raffleId');

  if (!raffleId) {
    return NextResponse.json({ success: false, error: 'raffleId es requerido' }, { status: 400 });
  }

  try {
    const tickets = await getRaffleTickets(raffleId);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      raffleId, 
      number, 
      newStatus, 
      customerName, 
      customerPhone, 
      customerCedula, 
      customerEmail,
      channel 
    } = body;

    if (!raffleId || !number || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'raffleId, number y newStatus son obligatorios' },
        { status: 400 }
      );
    }

    const updated = await updateTicketStatus(raffleId, number, newStatus, {
      customerName,
      customerPhone,
      customerCedula,
      customerEmail,
      channel,
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
