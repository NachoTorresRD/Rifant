import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRaffleBySlug, getRaffleStats, getRaffleTickets } from '@/lib/db';
import RaffleClientView from './RaffleClientView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0; // Fresh dynamic data on every request

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;
  const raffle = await getRaffleBySlug(slug);

  if (!raffle) {
    return {
      title: 'Rifa No Encontrada | RifaNT',
    };
  }

  const title = `${raffle.title} | Rifa Oficial RifaNT`;
  const description = `¡Participa por ${raffle.currency}${raffle.pricePerTicket}! ${raffle.description.substring(0, 160)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: raffle.imageUrl,
          width: 1200,
          height: 630,
          alt: raffle.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [raffle.imageUrl],
    },
  };
}

export default async function RafflePage({ params }: PageProps) {
  const { slug } = await params;
  const raffle = await getRaffleBySlug(slug);

  if (!raffle) {
    notFound();
  }

  const [stats, tickets] = await Promise.all([
    getRaffleStats(raffle.id),
    getRaffleTickets(raffle.id),
  ]);

  return (
    <RaffleClientView
      initialRaffle={raffle}
      initialStats={stats}
      initialTickets={tickets}
    />
  );
}
