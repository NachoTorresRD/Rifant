import { notFound, redirect } from 'next/navigation';
import { verifyAdminAuth } from '@/lib/auth';
import { getRaffleById, getRaffleStats } from '@/lib/db';
import EditRaffleClientView from './EditRaffleClientView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function AdminEditRafflePage({ params }: PageProps) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const raffle = await getRaffleById(id);

  if (!raffle) {
    notFound();
  }

  const stats = await getRaffleStats(id);

  return <EditRaffleClientView initialRaffle={raffle} stats={stats} />;
}
