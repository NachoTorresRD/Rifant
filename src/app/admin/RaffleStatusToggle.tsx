'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RaffleStatus } from '@/lib/types';

interface RaffleStatusToggleProps {
  raffleId: string;
  currentStatus: RaffleStatus;
}

export default function RaffleStatusToggle({
  raffleId,
  currentStatus,
}: RaffleStatusToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RaffleStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: RaffleStatus) => {
    if (newStatus === status) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/raffles/${raffleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'FINISHED') {
    return (
      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        🏆 Finalizada
      </span>
    );
  }

  return (
    <div className="inline-flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-semibold">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleStatusChange('ACTIVE')}
        className={`px-2 py-0.5 rounded-md transition-all ${
          status === 'ACTIVE'
            ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        Activa
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleStatusChange('PAUSED')}
        className={`px-2 py-0.5 rounded-md transition-all ${
          status === 'PAUSED'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        Pausada
      </button>
    </div>
  );
}
