import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getRaffleBySlug } from '@/lib/db';
import WinnerCelebration from './WinnerCelebration';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const raffle = await getRaffleBySlug(slug);

  if (!raffle) {
    return { title: 'Ganador | RifaNT' };
  }

  return {
    title: `🏆 ¡Tenemos Ganador de ${raffle.title}! | RifaNT`,
    description: `El número ganador fue #${raffle.winnerTicket || 'N/A'}. ¡Felicidades al afortunado ganador!`,
    openGraph: {
      images: [{ url: raffle.imageUrl }],
    },
  };
}

export default async function WinnerPage({ params }: PageProps) {
  const { slug } = await params;
  const raffle = await getRaffleBySlug(slug);

  if (!raffle) {
    notFound();
  }

  return <WinnerCelebration raffle={raffle} />;
}
