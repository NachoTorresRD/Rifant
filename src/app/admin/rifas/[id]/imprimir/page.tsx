import { notFound, redirect } from 'next/navigation';
import { verifyAdminAuth } from '@/lib/auth';
import { getRaffleById, getRaffleTickets } from '@/lib/db';
import PrintTicketsClientView from './PrintTicketsClientView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function AdminPrintTicketsPage({ params }: PageProps) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const raffle = await getRaffleById(id);

  if (!raffle) {
    notFound();
  }

  const tickets = await getRaffleTickets(id);

  return <PrintTicketsClientView raffle={raffle} tickets={tickets} />;
}
