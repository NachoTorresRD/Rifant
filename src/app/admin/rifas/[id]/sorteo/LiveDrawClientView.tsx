'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Trophy, Sparkles, Play, CheckCircle2, 
  Share2, Users, AlertCircle, ExternalLink, Ticket as TicketIcon 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Raffle, Ticket } from '@/lib/types';

interface LiveDrawClientViewProps {
  raffle: Raffle;
  soldTickets: Ticket[];
}

export default function LiveDrawClientView({
  raffle,
  soldTickets,
}: LiveDrawClientViewProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(
    raffle.winnerTicket || (soldTickets[0]?.number ?? '000')
  );
  const [winnerResult, setWinnerResult] = useState<{
    winnerTicket: string;
    winnerName: string;
    winnerPhone: string;
  } | null>(
    raffle.winnerTicket
      ? {
          winnerTicket: raffle.winnerTicket,
          winnerName: raffle.winnerName || 'Ganador',
          winnerPhone: raffle.winnerPhone || '',
        }
      : null
  );
  const [errorMsg, setErrorMsg] = useState('');

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch (e) {}
  };

  const handleStartDraw = async () => {
    if (soldTickets.length === 0) {
      setErrorMsg('No hay boletos vendidos en esta rifa para sortear');
      return;
    }

    setErrorMsg('');
    setIsSpinning(true);
    setWinnerResult(null);

    // 1. Call backend to obtain verifiable registered winner
    let backendWinner: { winnerTicket: string; winnerName: string; winnerPhone: string } | null = null;

    try {
      const res = await fetch('/api/admin/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffleId: raffle.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al ejecutar sorteo');
      }

      backendWinner = data.winner;
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en el servidor');
      setIsSpinning(false);
      return;
    }

    // 2. High adrenaline tumbler visual animation
    let speed = 50; // ms
    let elapsed = 0;
    const totalDuration = 4500; // 4.5 seconds

    const spin = () => {
      const randomTicket = soldTickets[Math.floor(Math.random() * soldTickets.length)];
      setDisplayNumber(randomTicket.number);
      elapsed += speed;

      if (elapsed > totalDuration - 1500) {
        speed += 30; // Slow down effect near the end
      }

      if (elapsed >= totalDuration) {
        // Stop animation on the EXACT registered winner from backend
        setDisplayNumber(backendWinner!.winnerTicket);
        setWinnerResult(backendWinner);
        setIsSpinning(false);
        triggerConfetti();
      } else {
        spinIntervalRef.current = setTimeout(spin, speed);
      }
    };

    spin();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Tómbola y Sorteo Oficial en Vivo
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Sorteo: {raffle.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          El sistema seleccionará de manera verificable un ganador únicamente entre los {soldTickets.length} boletos con pago confirmado.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TUMBLER & SLOT MACHINE CARD */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-12 text-center shadow-2xl overflow-hidden space-y-8">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Prize Thumbnail */}
        <div className="relative z-10 flex items-center justify-center gap-3 bg-slate-950 border border-slate-800 py-2 px-4 rounded-2xl max-w-sm mx-auto">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0">
            <Image
              src={raffle.imageUrl}
              alt={raffle.title}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs font-bold text-slate-200 truncate">
            {raffle.title}
          </span>
        </div>

        {/* THE GIANT TUMBLER NUMBER DISPLAY */}
        <div className="relative z-10 max-w-sm mx-auto">
          <div className="bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 p-1.5 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.25)]">
            <div className="bg-slate-950 rounded-[20px] py-8 sm:py-12 px-6 flex flex-col items-center justify-center">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">
                {isSpinning ? '🎰 TÓMBOLA GIRANDO...' : 'NÚMERO SORTEADO'}
              </span>
              <div
                className={`font-mono font-black text-6xl sm:text-7xl tracking-wider transition-all ${
                  isSpinning
                    ? 'text-amber-300 scale-105 blur-[0.5px]'
                    : winnerResult
                    ? 'text-yellow-400 scale-110'
                    : 'text-slate-300'
                }`}
              >
                #{displayNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10">
          <button
            type="button"
            disabled={isSpinning || soldTickets.length === 0}
            onClick={handleStartDraw}
            className="btn-glow px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black font-display text-base tracking-wide shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                SORTEANDO GANADOR...
              </span>
            ) : winnerResult ? (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-slate-950" />
                SORTEAR NUEVAMENTE
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-slate-950" />
                🎰 INICIAR SORTEO OFICIAL
              </span>
            )}
          </button>
        </div>

        {/* WINNER DETAILS BOX */}
        {winnerResult && (
          <div className="relative z-10 max-w-md mx-auto bg-slate-950 border-2 border-emerald-500/60 rounded-3xl p-6 space-y-4 animate-pop-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                ¡Tenemos Ganador Oficial!
              </span>
              <h3 className="text-2xl font-black font-display text-white mt-1">
                Boleto #{winnerResult.winnerTicket}
              </h3>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Afortunado(a):</span>
                <span className="text-white font-bold text-sm">{winnerResult.winnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Teléfono / WhatsApp:</span>
                <span className="text-emerald-400 font-mono font-semibold">{winnerResult.winnerPhone}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                href={`/rifa/${raffle.slug}/ganador`}
                target="_blank"
                className="flex-1 btn-glow flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                <span>Ver Pantalla Pública de Ganador</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* PARTICIPATING TICKETS OVERVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Boletos Participantes Vendidos ({soldTickets.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Únicamente los números confirmados entran a la tómbola
          </span>
        </div>

        {soldTickets.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Aún no hay boletos vendidos con pago confirmado en esta rifa.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
            {soldTickets.map((t) => (
              <span
                key={t.id}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono font-bold text-xs"
                title={`${t.number} - ${t.customerName || 'Vendido'}`}
              >
                #{t.number}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
