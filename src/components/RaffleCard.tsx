import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Flame, Ticket, ArrowRight, Trophy, Tag } from 'lucide-react';
import { Raffle, RaffleStats } from '@/lib/types';

interface RaffleCardProps {
  raffle: Raffle & { stats?: RaffleStats };
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const stats = raffle.stats || {
    totalTickets: raffle.totalTickets,
    availableTickets: raffle.totalTickets,
    reservedTickets: 0,
    soldTickets: 0,
    totalRevenue: 0,
    potentialRevenue: raffle.totalTickets * raffle.pricePerTicket,
    percentageSold: 0,
    uniqueParticipants: 0,
  };

  const isFinished = raffle.status === 'FINISHED';
  const drawDateObj = new Date(raffle.drawDate);
  const formattedDate = drawDateObj.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5">
      
      {/* Image Container with Badge Overlays */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <Image
          src={raffle.imageUrl}
          alt={raffle.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
            {raffle.category}
          </span>
          {raffle.promoText && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md border border-red-400/30">
              {raffle.promoText}
            </span>
          )}
        </div>

        {/* Status / Urgency Badge */}
        <div className="absolute top-3.5 right-3.5">
          {isFinished ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 shadow-md">
              <Trophy className="w-3.5 h-3.5" />
              Sorteada
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-slate-950 shadow-md">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              Activa
            </span>
          )}
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-3 left-3.5">
          <div className="flex items-baseline gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-lg">
            <span className="text-xs text-slate-400 font-medium">Boleto:</span>
            <span className="text-lg font-black text-amber-400 font-display">
              {raffle.currency}{raffle.pricePerTicket.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
            {raffle.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {raffle.description}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3 pt-2">
          
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">
                {stats.soldTickets} / {stats.totalTickets} números vendidos
              </span>
              <span className="font-bold text-amber-400">
                {stats.percentageSold}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                style={{ width: `${Math.min(stats.percentageSold, 100)}%` }}
              />
            </div>
          </div>

          {/* Draw Date & Available Numbers */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Sorteo: {formattedDate}</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Flame className="w-3.5 h-3.5 fill-emerald-400/20" />
              <span>{stats.availableTickets} disponibles</span>
            </div>
          </div>

        </div>

        {/* CTA Button */}
        <div className="pt-2">
          {isFinished ? (
            <Link
              href={`/rifa/${raffle.slug}/ganador`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>Ver Ganador Oficial</span>
            </Link>
          ) : (
            <Link
              href={`/rifa/${raffle.slug}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/10 active:scale-95 transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>Participar Ahora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
