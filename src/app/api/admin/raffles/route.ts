import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { createRaffle, getAllRaffles } from '@/lib/db';

export async function GET() {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const raffles = await getAllRaffles();
  return NextResponse.json({ success: true, raffles });
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      category,
      imageUrl,
      pricePerTicket,
      currency,
      totalTickets,
      digitsCount,
      drawDate,
      organizerName,
      organizerPhone,
      instagramUrl,
      facebookUrl,
    } = body;

    if (!title || !slug || !pricePerTicket || !totalTickets || !drawDate || !organizerPhone) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const newRaffle = await createRaffle({
      title: title.trim(),
      slug: cleanSlug,
      description: description?.trim() || '',
      category: category?.trim() || 'General',
      imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
      pricePerTicket: Number(pricePerTicket),
      currency: currency || 'RD$',
      totalTickets: Number(totalTickets),
      digitsCount: Number(digitsCount) || (Number(totalTickets) <= 100 ? 2 : 3),
      drawDate: new Date(drawDate).toISOString(),
      status: 'ACTIVE',
      organizerName: organizerName?.trim() || 'Organizador RifaNT',
      organizerPhone: organizerPhone.trim(),
      instagramUrl: instagramUrl?.trim() || '',
      facebookUrl: facebookUrl?.trim() || '',
      winnerTicket: null,
      winnerName: null,
      winnerPhone: null,
      drawnAt: null,
    });

    return NextResponse.json({ success: true, raffle: newRaffle });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear la rifa' },
      { status: 400 }
    );
  }
}
