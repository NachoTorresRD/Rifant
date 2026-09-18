export type RaffleStatus = 'ACTIVE' | 'PAUSED' | 'FINISHED' | 'CANCELLED';
export type TicketStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export interface Raffle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  pricePerTicket: number;
  currency: string;
  totalTickets: number;
  digitsCount: number;
  drawDate: string; // ISO string
  drawTime?: string; // e.g. "08:00 P.M."
  status: RaffleStatus;

  // Promotions / Combos
  promoText?: string; // e.g. "2 BOLETOS POR RD$500"
  comboQty?: number; // e.g. 2
  comboPrice?: number; // e.g. 500
  
  // Organizer details
  organizerName: string;
  organizerPhone: string; // WhatsApp
  instagramUrl?: string;
  facebookUrl?: string;

  // Winner details (when drawn)
  winnerTicket?: string | null;
  winnerName?: string | null;
  winnerPhone?: string | null;
  drawnAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  raffleId: string;
  number: string; // Formatted e.g. "000", "001", "025"
  status: TicketStatus;
  reservedAt?: string | null;
  reservationExpiresAt?: string | null; // ISO string (10 mins hold)
  customerName?: string | null;
  customerPhone?: string | null;
  customerCedula?: string | null; // Cédula o Documento de Identidad
  customerEmail?: string | null;
  orderId?: string | null;
  channel?: 'DIGITAL' | 'PHYSICAL'; // Venta digital web o talonario físico
  updatedAt: string;
}

export interface Order {
  id: string;
  raffleId: string;
  customerName: string;
  customerPhone: string;
  customerCedula?: string | null;
  customerEmail?: string | null;
  ticketNumbers: string[];
  ticketsCount: number;
  totalAmount: number;
  discountApplied?: number;
  status: OrderStatus;
  paymentMethod: string;
  expiresAt: string;
  createdAt: string;
}

export interface RaffleStats {
  totalTickets: number;
  availableTickets: number;
  reservedTickets: number;
  soldTickets: number;
  soldDigital?: number;
  soldPhysical?: number;
  totalRevenue: number;
  potentialRevenue: number;
  percentageSold: number;
  uniqueParticipants: number;
}

