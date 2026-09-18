import fs from 'fs/promises';
import path from 'path';
import { getDatabase } from './mongodb';
import { Raffle, Ticket, Order, RaffleStats, TicketStatus } from './types';
import { calculateRafflePrice } from './pricing';

export { calculateRafflePrice };

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// In-process lock for local fallback
let lockPromise = Promise.resolve();
async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  let release: () => void;
  const nextLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  const prevLock = lockPromise;
  lockPromise = nextLock;

  await prevLock;
  try {
    return await fn();
  } finally {
    release!();
  }
}

// Check if MongoDB Atlas is reachable (with short timeout so requests don't hang)
let atlasStatus: 'CHECKING' | 'CONNECTED' | 'UNAVAILABLE' = 'CHECKING';
let lastCheckTime = 0;

async function checkAtlasConnection(): Promise<boolean> {
  const now = Date.now();
  // Cache check for 10 seconds
  if (atlasStatus !== 'CHECKING' && now - lastCheckTime < 10000) {
    return atlasStatus === 'CONNECTED';
  }

  lastCheckTime = now;
  try {
    const db = await getDatabase();
    if (!db) {
      atlasStatus = 'UNAVAILABLE';
      return false;
    }
    // Quick ping to check network access
    await db.command({ ping: 1 }, { timeoutMS: 2000 });
    if (atlasStatus !== 'CONNECTED') {
      console.log('✅ Conectado exitosamente a MongoDB Atlas (Cloud Database).');
    }
    atlasStatus = 'CONNECTED';
    return true;
  } catch (err: any) {
    if (atlasStatus !== 'UNAVAILABLE') {
      console.warn('⚠️ No se pudo conectar a MongoDB Atlas (posiblemente falta agregar 0.0.0.0/0 en "Network Access" en mongodb.com). Usando almacenamiento seguro en memoria mientras tanto.');
    }
    atlasStatus = 'UNAVAILABLE';
    return false;
  }
}

// -------------------------------------------------------------
// LOCAL FALLBACK DB METHODS
// -------------------------------------------------------------
interface LocalDatabaseSchema {
  raffles: Raffle[];
  tickets: Ticket[];
  orders: Order[];
}

function generateInitialData(): LocalDatabaseSchema {
  const now = new Date();
  const iphoneDrawDate = new Date('2026-11-27T20:00:00.000Z');
  
  const iphoneRaffle: Raffle = {
    id: 'raf-iphone-17',
    slug: 'iphone-17-pro-max',
    title: 'RIFA iPhone 17 Pro Max - ¡TUYO PUEDE SER!',
    description: '¡Participa en el sorteo oficial del nuevo iPhone 17 Pro Max! Boletos físicos y digitales 100% verificados.',
    category: 'Tecnología',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop',
    pricePerTicket: 300,
    currency: 'RD$',
    comboQty: 2,
    comboPrice: 500,
    promoText: '2 BOLETOS POR RD$500',
    totalTickets: 100,
    digitsCount: 2,
    drawDate: iphoneDrawDate.toISOString(),
    drawTime: '08:00 P.M.',
    status: 'ACTIVE',
    organizerName: 'Sorteos VIP RD',
    organizerPhone: '+18295551234',
    instagramUrl: 'https://instagram.com/sorteosrdvip',
    facebookUrl: 'https://facebook.com/sorteosrdvip',
    winnerTicket: null,
    winnerName: null,
    winnerPhone: null,
    drawnAt: null,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
  };

  const ps5DrawDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const ps5Raffle: Raffle = {
    id: 'raf-ps5-pro',
    slug: 'playstation-5-pro',
    title: '🎮 PlayStation 5 Pro 2TB + 2do Control DualSense',
    description: 'La consola de nueva generación definitiva para disfrutar en 4K y 120 FPS. Incluye 2 controles inalámbricos y suscripción PS Plus de 3 meses.',
    category: 'Gaming',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200&auto=format&fit=crop',
    pricePerTicket: 150,
    currency: 'RD$',
    totalTickets: 100,
    digitsCount: 2,
    drawDate: ps5DrawDate.toISOString(),
    drawTime: '08:00 P.M.',
    status: 'ACTIVE',
    organizerName: 'Gaming Sorteos Caribe',
    organizerPhone: '+18095554321',
    winnerTicket: null,
    winnerName: null,
    winnerPhone: null,
    drawnAt: null,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
  };

  const cashDrawDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const cashRaffle: Raffle = {
    id: 'raf-cash-50k',
    slug: '50000-efectivo',
    title: '💵 RD$ 50,000 en Efectivo Transferencia Inmediata',
    description: '¡Dinero en efectivo directo a tu cuenta bancaria (Banreservas, BHD, Popular) o entrega personal!',
    category: 'Dinero',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=1200&auto=format&fit=crop',
    pricePerTicket: 100,
    currency: 'RD$',
    totalTickets: 100,
    digitsCount: 2,
    drawDate: cashDrawDate.toISOString(),
    drawTime: '08:00 P.M.',
    status: 'FINISHED',
    organizerName: 'Premios Express RD',
    organizerPhone: '+18495558888',
    winnerTicket: '42',
    winnerName: 'Juan Carlos Pérez',
    winnerPhone: '+1809***1234',
    drawnAt: cashDrawDate.toISOString(),
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: cashDrawDate.toISOString(),
  };

  const sampleBuyers = [
    { name: 'Carlos Morales', phone: '8095551122', cedula: '402-2345678-1' },
    { name: 'María Rodríguez', phone: '8295553344', cedula: '001-9876543-2' },
    { name: 'Pedro Santana', phone: '8495555566', cedula: '402-1122334-9' },
    { name: 'Lucía Fernández', phone: '8095557788', cedula: '001-5566778-4' },
    { name: 'José Miguel Díaz', phone: '8295559900', cedula: '402-8877665-0' },
  ];

  const tickets: Ticket[] = [];

  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, '0');
    let status: TicketStatus = 'AVAILABLE';
    let customerName: string | null = null;
    let customerPhone: string | null = null;
    let customerCedula: string | null = null;
    let reservedAt: string | null = null;
    let reservationExpiresAt: string | null = null;
    let channel: 'DIGITAL' | 'PHYSICAL' = 'DIGITAL';

    if (i < 58) {
      status = 'SOLD';
      const buyer = sampleBuyers[i % sampleBuyers.length];
      customerName = buyer.name;
      customerPhone = buyer.phone;
      customerCedula = buyer.cedula;
      channel = i % 2 === 0 ? 'PHYSICAL' : 'DIGITAL';
    } else if (i === 62 || i === 85) {
      status = 'RESERVED';
      customerName = 'Reserva Web Temporal';
      customerPhone = '8095550099';
      customerCedula = '402-0000000-0';
      reservedAt = new Date().toISOString();
      reservationExpiresAt = new Date(Date.now() + 8 * 60 * 1000).toISOString();
    }

    tickets.push({
      id: `t-iphone-${numStr}`,
      raffleId: iphoneRaffle.id,
      number: numStr,
      status,
      reservedAt,
      reservationExpiresAt,
      customerName,
      customerPhone,
      customerCedula,
      channel,
      updatedAt: now.toISOString(),
    });
  }

  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, '0');
    let status: TicketStatus = 'AVAILABLE';
    let customerName: string | null = null;
    let customerPhone: string | null = null;
    let customerCedula: string | null = null;

    if (i < 32 && (i % 2 === 0 || i % 3 === 0)) {
      status = 'SOLD';
      const buyer = sampleBuyers[i % sampleBuyers.length];
      customerName = buyer.name;
      customerPhone = buyer.phone;
      customerCedula = buyer.cedula;
    }

    tickets.push({
      id: `t-ps5-${numStr}`,
      raffleId: ps5Raffle.id,
      number: numStr,
      status,
      customerName,
      customerPhone,
      customerCedula,
      channel: 'DIGITAL',
      updatedAt: now.toISOString(),
    });
  }

  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, '0');
    const isWinner = numStr === '42';
    tickets.push({
      id: `t-cash-${numStr}`,
      raffleId: cashRaffle.id,
      number: numStr,
      status: 'SOLD',
      customerName: isWinner ? 'Juan Carlos Pérez' : sampleBuyers[i % sampleBuyers.length].name,
      customerPhone: isWinner ? '+1809***1234' : sampleBuyers[i % sampleBuyers.length].phone,
      customerCedula: isWinner ? '402-1234567-8' : sampleBuyers[i % sampleBuyers.length].cedula,
      channel: 'PHYSICAL',
      updatedAt: cashDrawDate.toISOString(),
    });
  }

  return {
    raffles: [iphoneRaffle, ps5Raffle, cashRaffle],
    tickets,
    orders: [],
  };
}

declare global {
  // eslint-disable-next-line no-var
  var _rifantMemoryDb: LocalDatabaseSchema | undefined;
}

async function readLocalDb(): Promise<LocalDatabaseSchema> {
  // 1. If in-memory is already loaded in this process/container, return it
  if (global._rifantMemoryDb) {
    return global._rifantMemoryDb;
  }

  // 2. Try to read from local file (works in local dev if file exists)
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    global._rifantMemoryDb = parsed;
    return parsed;
  } catch {
    // 3. In serverless (Vercel / Cloudflare) or if file doesn't exist:
    // Initialize in-memory store with default seed data
    const initialData = generateInitialData();
    global._rifantMemoryDb = initialData;

    // Try to write to disk ONLY if local environment allows it (ignore EROFS/errors)
    try {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch {
      // Ignored: read-only filesystem on Vercel / Cloudflare serverless environments
    }

    return initialData;
  }
}

async function writeLocalDb(data: LocalDatabaseSchema): Promise<void> {
  global._rifantMemoryDb = data;

  // Try to write to disk for local dev persistence; safely catch on serverless
  try {
    const tempPath = `${DB_PATH}.${Date.now()}.tmp`;
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, DB_PATH);
  } catch {
    // Read-only filesystem in serverless; memory state is already updated!
  }
}

function cleanupLocalExpired(tickets: Ticket[]): boolean {
  const now = new Date().getTime();
  let modified = false;

  for (const ticket of tickets) {
    if (ticket.status === 'RESERVED' && ticket.reservationExpiresAt) {
      const expiry = new Date(ticket.reservationExpiresAt).getTime();
      if (now > expiry) {
        ticket.status = 'AVAILABLE';
        ticket.reservedAt = null;
        ticket.reservationExpiresAt = null;
        ticket.customerName = null;
        ticket.customerPhone = null;
        ticket.customerCedula = null;
        ticket.customerEmail = null;
        ticket.orderId = null;
        ticket.updatedAt = new Date().toISOString();
        modified = true;
      }
    }
  }

  return modified;
}

// -------------------------------------------------------------
// PUBLIC UNIFIED API (ATLAS WITH SEAMLESS LOCAL FALLBACK)
// -------------------------------------------------------------

export async function getAllRaffles(): Promise<Raffle[]> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffles = await db.collection<Raffle>('raffles').find({}, { projection: { _id: 0 } }).toArray();
        if (raffles.length > 0) return raffles;

        // Auto-seed Atlas if connected but empty
        const initial = generateInitialData();
        await db.collection('raffles').insertMany(initial.raffles as any);
        await db.collection('tickets').insertMany(initial.tickets as any);
        return initial.raffles;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    return db.raffles;
  });
}

export async function getRaffleBySlug(slug: string): Promise<Raffle | null> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffle = await db.collection<Raffle>('raffles').findOne({ slug }, { projection: { _id: 0 } });
        if (raffle) return raffle;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const raffle = db.raffles.find((r) => r.slug === slug);
    return raffle || null;
  });
}

export async function getRaffleById(id: string): Promise<Raffle | null> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffle = await db.collection<Raffle>('raffles').findOne({ id }, { projection: { _id: 0 } });
        if (raffle) return raffle;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const raffle = db.raffles.find((r) => r.id === id);
    return raffle || null;
  });
}

export async function getRaffleTickets(raffleId: string): Promise<Ticket[]> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const nowStr = new Date().toISOString();
        await db.collection<Ticket>('tickets').updateMany(
          { raffleId, status: 'RESERVED', reservationExpiresAt: { $lt: nowStr } },
          { $set: { status: 'AVAILABLE', reservedAt: null, reservationExpiresAt: null, customerName: null, customerPhone: null, customerCedula: null, orderId: null, updatedAt: nowStr } }
        );
        const tickets = await db.collection<Ticket>('tickets').find({ raffleId }, { projection: { _id: 0 } }).sort({ number: 1 }).toArray();
        if (tickets.length > 0) return tickets;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const modified = cleanupLocalExpired(db.tickets);
    if (modified) await writeLocalDb(db);
    return db.tickets.filter((t) => t.raffleId === raffleId);
  });
}

export async function getRaffleStats(raffleId: string): Promise<RaffleStats> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffle = await db.collection<Raffle>('raffles').findOne({ id: raffleId }, { projection: { _id: 0 } });
        const tickets = await db.collection<Ticket>('tickets').find({ raffleId }, { projection: { _id: 0 } }).toArray();

        if (raffle && tickets.length > 0) {
          const total = tickets.length;
          let available = 0;
          let reserved = 0;
          let sold = 0;
          let soldDigital = 0;
          let soldPhysical = 0;
          const participants = new Set<string>();

          for (const t of tickets) {
            if (t.status === 'AVAILABLE') available++;
            else if (t.status === 'RESERVED') reserved++;
            else if (t.status === 'SOLD') {
              sold++;
              if (t.channel === 'PHYSICAL') {
                soldPhysical++;
              } else {
                soldDigital++;
              }
              if (t.customerPhone) participants.add(t.customerPhone);
            }
          }

          const price = raffle?.pricePerTicket || 0;
          return {
            totalTickets: total,
            availableTickets: available,
            reservedTickets: reserved,
            soldTickets: sold,
            soldDigital,
            soldPhysical,
            totalRevenue: sold * price,
            potentialRevenue: total * price,
            percentageSold: total > 0 ? Math.round((sold / total) * 100) : 0,
            uniqueParticipants: participants.size,
          };
        }
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    cleanupLocalExpired(db.tickets);

    const raffle = db.raffles.find((r) => r.id === raffleId);
    const tickets = db.tickets.filter((t) => t.raffleId === raffleId);

    const total = tickets.length;
    let available = 0;
    let reserved = 0;
    let sold = 0;
    let soldDigital = 0;
    let soldPhysical = 0;
    const participants = new Set<string>();

    for (const t of tickets) {
      if (t.status === 'AVAILABLE') available++;
      else if (t.status === 'RESERVED') reserved++;
      else if (t.status === 'SOLD') {
        sold++;
        if (t.channel === 'PHYSICAL') {
          soldPhysical++;
        } else {
          soldDigital++;
        }
        if (t.customerPhone) participants.add(t.customerPhone);
      }
    }

    const price = raffle?.pricePerTicket || 0;
    return {
      totalTickets: total,
      availableTickets: available,
      reservedTickets: reserved,
      soldTickets: sold,
      soldDigital,
      soldPhysical,
      totalRevenue: sold * price,
      potentialRevenue: total * price,
      percentageSold: total > 0 ? Math.round((sold / total) * 100) : 0,
      uniqueParticipants: participants.size,
    };
  });
}

export async function reserveTickets(params: {
  raffleId: string;
  numbers: string[];
  customerName: string;
  customerPhone: string;
  customerCedula?: string;
  customerEmail?: string;
}): Promise<{ order: Order; tickets: Ticket[]; discount: number }> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffle = await db.collection<Raffle>('raffles').findOne({ id: params.raffleId }, { projection: { _id: 0 } });
        if (raffle) {
          const { total: totalAmount, discount } = calculateRafflePrice(raffle, params.numbers.length);
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
          const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          const updateResult = await db.collection<Ticket>('tickets').updateMany(
            { raffleId: params.raffleId, number: { $in: params.numbers }, status: 'AVAILABLE' },
            {
              $set: {
                status: 'RESERVED',
                reservedAt: now.toISOString(),
                reservationExpiresAt: expiresAt.toISOString(),
                customerName: params.customerName.trim(),
                customerPhone: params.customerPhone.trim(),
                customerCedula: params.customerCedula ? params.customerCedula.trim() : null,
                customerEmail: params.customerEmail ? params.customerEmail.trim() : null,
                orderId,
                channel: 'DIGITAL',
                updatedAt: now.toISOString(),
              },
            }
          );

          if (updateResult.modifiedCount === params.numbers.length) {
            const order: Order = {
              id: orderId,
              raffleId: params.raffleId,
              customerName: params.customerName.trim(),
              customerPhone: params.customerPhone.trim(),
              customerCedula: params.customerCedula ? params.customerCedula.trim() : null,
              customerEmail: params.customerEmail ? params.customerEmail.trim() : null,
              ticketNumbers: params.numbers,
              ticketsCount: params.numbers.length,
              totalAmount,
              discountApplied: discount,
              status: 'PENDING',
              paymentMethod: 'MANUAL_WHATSAPP',
              expiresAt: expiresAt.toISOString(),
              createdAt: now.toISOString(),
            };

            await db.collection<Order>('orders').insertOne(order);
            const reservedTickets = await db.collection<Ticket>('tickets').find({ raffleId: params.raffleId, orderId }, { projection: { _id: 0 } }).toArray();
            return { order, tickets: reservedTickets, discount };
          }
        }
      }
    } catch (e) {}
  }

  // Local fallback
  return withLock(async () => {
    const db = await readLocalDb();
    cleanupLocalExpired(db.tickets);

    const raffle = db.raffles.find((r) => r.id === params.raffleId);
    if (!raffle) throw new Error('Rifa no encontrada');
    if (raffle.status !== 'ACTIVE') throw new Error('Esta rifa no está activa para nuevas reservas');

    const requestedTickets: Ticket[] = [];
    for (const num of params.numbers) {
      const ticket = db.tickets.find((t) => t.raffleId === params.raffleId && t.number === num);
      if (!ticket) throw new Error(`El número #${num} no existe`);
      if (ticket.status !== 'AVAILABLE') throw new Error(`El número #${num} ya no está disponible`);
      requestedTickets.push(ticket);
    }

    const { total: totalAmount, discount } = calculateRafflePrice(raffle, requestedTickets.length);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const order: Order = {
      id: orderId,
      raffleId: params.raffleId,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      customerCedula: params.customerCedula ? params.customerCedula.trim() : null,
      customerEmail: params.customerEmail ? params.customerEmail.trim() : null,
      ticketNumbers: params.numbers,
      ticketsCount: params.numbers.length,
      totalAmount,
      discountApplied: discount,
      status: 'PENDING',
      paymentMethod: 'MANUAL_WHATSAPP',
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    };

    for (const t of requestedTickets) {
      t.status = 'RESERVED';
      t.reservedAt = now.toISOString();
      t.reservationExpiresAt = expiresAt.toISOString();
      t.customerName = params.customerName.trim();
      t.customerPhone = params.customerPhone.trim();
      t.customerCedula = params.customerCedula ? params.customerCedula.trim() : null;
      t.orderId = orderId;
      t.channel = 'DIGITAL';
      t.updatedAt = now.toISOString();
    }

    db.orders.push(order);
    await writeLocalDb(db);
    return { order, tickets: requestedTickets, discount };
  });
}

export async function updateTicketStatus(
  raffleId: string,
  number: string,
  newStatus: TicketStatus,
  customerData?: {
    customerName?: string | null;
    customerPhone?: string | null;
    customerCedula?: string | null;
    customerEmail?: string | null;
    channel?: 'DIGITAL' | 'PHYSICAL';
  }
): Promise<Ticket> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const updateFields: any = { status: newStatus, updatedAt: new Date().toISOString() };
        if (newStatus === 'AVAILABLE') {
          updateFields.reservedAt = null;
          updateFields.reservationExpiresAt = null;
          updateFields.customerName = null;
          updateFields.customerPhone = null;
          updateFields.customerCedula = null;
          updateFields.orderId = null;
        } else {
          if (customerData?.customerName !== undefined) updateFields.customerName = customerData.customerName;
          if (customerData?.customerPhone !== undefined) updateFields.customerPhone = customerData.customerPhone;
          if (customerData?.customerCedula !== undefined) updateFields.customerCedula = customerData.customerCedula;
          if (customerData?.channel !== undefined) updateFields.channel = customerData.channel;
          if (newStatus === 'SOLD') updateFields.reservationExpiresAt = null;
        }
        const res = await db.collection<Ticket>('tickets').findOneAndUpdate(
          { raffleId, number },
          { $set: updateFields },
          { returnDocument: 'after', projection: { _id: 0 } }
        );
        if (res) return res as Ticket;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const ticket = db.tickets.find((t) => t.raffleId === raffleId && t.number === number);
    if (!ticket) throw new Error(`Boleto #${number} no encontrado`);

    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();

    if (newStatus === 'AVAILABLE') {
      ticket.reservedAt = null;
      ticket.reservationExpiresAt = null;
      ticket.customerName = null;
      ticket.customerPhone = null;
      ticket.customerCedula = null;
      ticket.customerEmail = null;
      ticket.orderId = null;
    } else {
      if (customerData?.customerName !== undefined) ticket.customerName = customerData.customerName;
      if (customerData?.customerPhone !== undefined) ticket.customerPhone = customerData.customerPhone;
      if (customerData?.customerCedula !== undefined) ticket.customerCedula = customerData.customerCedula;
      if (customerData?.channel !== undefined) ticket.channel = customerData.channel;
      if (newStatus === 'SOLD') ticket.reservationExpiresAt = null;
    }

    await writeLocalDb(db);
    return ticket;
  });
}

export async function createRaffle(data: Omit<Raffle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Raffle> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const id = `raf-${Date.now()}`;
        const now = new Date().toISOString();
        const newRaffle: Raffle = { ...data, id, createdAt: now, updatedAt: now };
        const tickets: Ticket[] = [];
        for (let i = 0; i < data.totalTickets; i++) {
          const numStr = i.toString().padStart(data.digitsCount, '0');
          tickets.push({
            id: `t-${id}-${numStr}`,
            raffleId: id,
            number: numStr,
            status: 'AVAILABLE',
            updatedAt: now,
          });
        }
        await db.collection('raffles').insertOne(newRaffle as any);
        await db.collection('tickets').insertMany(tickets as any);
        return newRaffle;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const id = `raf-${Date.now()}`;
    const now = new Date().toISOString();

    const newRaffle: Raffle = { ...data, id, createdAt: now, updatedAt: now };
    for (let i = 0; i < data.totalTickets; i++) {
      const numStr = i.toString().padStart(data.digitsCount, '0');
      db.tickets.push({
        id: `t-${id}-${numStr}`,
        raffleId: id,
        number: numStr,
        status: 'AVAILABLE',
        updatedAt: now,
      });
    }

    db.raffles.unshift(newRaffle);
    await writeLocalDb(db);
    return newRaffle;
  });
}

export async function updateRaffle(id: string, updates: Partial<Raffle>): Promise<Raffle> {
  const isAtlas = await checkAtlasConnection();

  if (updates.totalTickets) {
    const total = Number(updates.totalTickets);
    updates.digitsCount = total <= 100 ? 2 : (total <= 1000 ? 3 : 4);
  }

  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const now = new Date().toISOString();
        const res = await db.collection<Raffle>('raffles').findOneAndUpdate(
          { id },
          { $set: { ...updates, updatedAt: now } },
          { returnDocument: 'after', projection: { _id: 0 } }
        );

        if (updates.totalTickets) {
          const newTotal = Number(updates.totalTickets);
          const digitsCount = updates.digitsCount || 2;
          const currentTickets = await db
            .collection<Ticket>('tickets')
            .find({ raffleId: id })
            .sort({ number: 1 })
            .toArray();

          if (newTotal > currentTickets.length) {
            const addCount = newTotal - currentTickets.length;
            const newTickets: Ticket[] = [];
            for (let i = currentTickets.length; i < newTotal; i++) {
              const numStr = i.toString().padStart(digitsCount, '0');
              newTickets.push({
                id: `t-${id}-${numStr}`,
                raffleId: id,
                number: numStr,
                status: 'AVAILABLE',
                updatedAt: now,
              });
            }
            if (newTickets.length > 0) {
              await db.collection('tickets').insertMany(newTickets as any);
            }
          } else if (newTotal < currentTickets.length) {
            const excess = currentTickets.slice(newTotal);
            const excessIds = excess.map((t) => t.id);
            if (excessIds.length > 0) {
              await db.collection('tickets').deleteMany({ id: { $in: excessIds } });
            }
          }
        }

        if (res) return res as Raffle;
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const index = db.raffles.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Rifa no encontrada');

    const now = new Date().toISOString();
    const oldTotal = db.raffles[index].totalTickets;
    db.raffles[index] = { ...db.raffles[index], ...updates, updatedAt: now };

    if (updates.totalTickets && Number(updates.totalTickets) !== oldTotal) {
      const newTotal = Number(updates.totalTickets);
      const digitsCount = updates.digitsCount || 2;
      const raffleTickets = db.tickets.filter((t) => t.raffleId === id);

      if (newTotal > raffleTickets.length) {
        for (let i = raffleTickets.length; i < newTotal; i++) {
          const numStr = i.toString().padStart(digitsCount, '0');
          db.tickets.push({
            id: `t-${id}-${numStr}`,
            raffleId: id,
            number: numStr,
            status: 'AVAILABLE',
            updatedAt: now,
          });
        }
      } else if (newTotal < raffleTickets.length) {
        let kept = 0;
        db.tickets = db.tickets.filter((t) => {
          if (t.raffleId !== id) return true;
          if (kept < newTotal) {
            kept++;
            return true;
          }
          return false;
        });
      }
    }

    await writeLocalDb(db);
    return db.raffles[index];
  });
}

export async function deleteRaffle(id: string): Promise<void> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('raffles').deleteOne({ id });
        await db.collection('tickets').deleteMany({ raffleId: id });
        await db.collection('orders').deleteMany({ raffleId: id });
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    db.raffles = db.raffles.filter((r) => r.id !== id);
    db.tickets = db.tickets.filter((t) => t.raffleId !== id);
    db.orders = db.orders.filter((o) => o.raffleId !== id);
    await writeLocalDb(db);
  });
}

export async function executeRaffleDraw(raffleId: string): Promise<{ winnerTicket: string; winnerName: string; winnerPhone: string }> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffle = await db.collection<Raffle>('raffles').findOne({ id: raffleId }, { projection: { _id: 0 } });
        if (!raffle) throw new Error('Rifa no encontrada');
        const tickets = await db.collection<Ticket>('tickets').find({ raffleId, status: 'SOLD' }, { projection: { _id: 0 } }).toArray();
        if (tickets.length === 0) throw new Error('No hay boletos vendidos');
        const randomIndex = Math.floor(Math.random() * tickets.length);
        const chosenTicket = tickets[randomIndex];
        const now = new Date().toISOString();
        const winnerTicket = chosenTicket.number;
        const winnerName = chosenTicket.customerName || 'Ganador';
        const winnerPhone = chosenTicket.customerPhone || 'N/A';

        await db.collection('raffles').updateOne(
          { id: raffleId },
          {
            $set: {
              winnerTicket,
              winnerName,
              winnerPhone,
              drawnAt: now,
              status: 'FINISHED',
              updatedAt: now,
            },
          }
        );

        return { winnerTicket, winnerName, winnerPhone };
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    const raffle = db.raffles.find((r) => r.id === raffleId);
    if (!raffle) throw new Error('Rifa no encontrada');

    const tickets = db.tickets.filter((t) => t.raffleId === raffleId && t.status === 'SOLD');
    if (tickets.length === 0) throw new Error('No hay boletos vendidos');

    const randomIndex = Math.floor(Math.random() * tickets.length);
    const chosenTicket = tickets[randomIndex];
    const now = new Date().toISOString();

    raffle.winnerTicket = chosenTicket.number;
    raffle.winnerName = chosenTicket.customerName || 'Ganador';
    raffle.winnerPhone = chosenTicket.customerPhone || 'N/A';
    raffle.drawnAt = now;
    raffle.status = 'FINISHED';

    await writeLocalDb(db);
    return {
      winnerTicket: chosenTicket.number,
      winnerName: raffle.winnerName,
      winnerPhone: raffle.winnerPhone,
    };
  });
}

export async function verifyTicketNumber(raffleIdOrSlug: string, ticketNumber: string): Promise<{
  ticket: Ticket;
  raffle: Raffle;
} | null> {
  const isAtlas = await checkAtlasConnection();
  if (isAtlas) {
    try {
      const db = await getDatabase();
      if (db) {
        const raffle = await db.collection<Raffle>('raffles').findOne(
          { $or: [{ id: raffleIdOrSlug }, { slug: raffleIdOrSlug }] },
          { projection: { _id: 0 } }
        );
        if (raffle) {
          const padded = ticketNumber.trim().padStart(raffle.digitsCount, '0');
          const ticket = await db.collection<Ticket>('tickets').findOne(
            { raffleId: raffle.id, number: padded },
            { projection: { _id: 0 } }
          );
          if (ticket) return { ticket, raffle };
        }
      }
    } catch (e) {}
  }

  return withLock(async () => {
    const db = await readLocalDb();
    cleanupLocalExpired(db.tickets);

    const raffle = db.raffles.find((r) => r.id === raffleIdOrSlug || r.slug === raffleIdOrSlug);
    if (!raffle) return null;

    const padded = ticketNumber.trim().padStart(raffle.digitsCount, '0');
    const ticket = db.tickets.find((t) => t.raffleId === raffle.id && t.number === padded);
    if (!ticket) return null;

    return { ticket, raffle };
  });
}
