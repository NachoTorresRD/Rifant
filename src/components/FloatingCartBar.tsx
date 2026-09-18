'use client';

import React from 'react';
import { Ticket, ArrowRight, X, Sparkles, Tag } from 'lucide-react';
import { Raffle } from '@/lib/types';
import { calculateRafflePrice } from '@/lib/pricing';

interface FloatingCartBarProps {
  raffle: Raffle;
  selectedNumbers: string[];
  pricePerTicket: number;
  currency: string;
  onOpenReservation: () => void;
  onClearSelection: () => void;
}

export default function FloatingCartBar({
  raffle,
  selectedNumbers,
  pricePerTicket,
  currency,
  onOpenReservation,
  onClearSelection,
}: FloatingCartBarProps) {
  if (selectedNumbers.length === 0) return null;

  // Calculate price with promo combos
  const { total: totalAmount, discount } = calculateRafflePrice(raffle, selectedNumbers.length);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-pop-in">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Summary & Selected Numbers Chips */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black font-display text-lg shadow-lg shadow-amber-400/30">
              {selectedNumbers.length}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  {selectedNumbers.length === 1 ? '1 número seleccionado' : `${selectedNumbers.length} números seleccionados`}
                </span>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
                  title="Quitar todos"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price calculation and combo badge */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Total a pagar:</span>
                <span className="text-lg sm:text-xl font-black font-display text-amber-400">
                  {currency}{totalAmount.toLocaleString()}
                </span>
                {discount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-700/50 px-2 py-0.5 rounded-md">
                    <Tag className="w-3 h-3" />
                    ¡Ahorras {currency}{discount}!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    ({selectedNumbers.length} × {currency}{pricePerTicket})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Numbers preview chips (compact) */}
          <div className="hidden md:flex items-center gap-1.5 max-w-[200px] overflow-x-auto py-1">
            {selectedNumbers.slice(0, 5).map((num) => (
              <span
                key={num}
                className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold whitespace-nowrap"
              >
                #{num}
              </span>
            ))}
            {selectedNumbers.length > 5 && (
              <span className="text-[10px] text-slate-400 font-semibold">
                +{selectedNumbers.length - 5}
              </span>
            )}
          </div>

        </div>

        {/* Right: Big CTA button */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenReservation}
            className="w-full sm:w-auto btn-glow flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black font-display text-base tracking-wide shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Ticket className="w-5 h-5 fill-slate-950" />
            <span>CONTINUAR RESERVA</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
}
