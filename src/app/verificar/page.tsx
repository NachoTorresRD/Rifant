import React from 'react';
import type { Metadata } from 'next';
import { getAllRaffles } from '@/lib/db';
import TicketVerifierClient from './TicketVerifierClient';

export const metadata: Metadata = {
  title: 'Verificador Oficial de Boletos | RifaNT',
  description: 'Verifica la autenticidad y el estado oficial de tus boletos físicos o digitales en tiempo real.',
};

export const revalidate = 0;

export default async function VerificarPage() {
  const raffles = await getAllRaffles();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <TicketVerifierClient raffles={raffles} />
    </div>
  );
}
