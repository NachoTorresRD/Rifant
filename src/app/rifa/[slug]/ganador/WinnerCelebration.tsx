'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Calendar, CheckCircle, Share2, ArrowLeft, Send, Sparkles, User, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Raffle } from '@/lib/types';

interface WinnerCelebrationProps {
  raffle: Raffle;
}

export default function WinnerCelebration({ raffle }: WinnerCelebrationProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory golden confetti
    try {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#FBBF24', '#10B981', '#3B82F6'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F59E0B', '#FBBF24', '#10B981', '#3B82F6'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      // ignore if canvas not supported
    }
  }, []);

  const drawDateObj = raffle.drawnAt ? new Date(raffle.drawnAt) : new Date(raffle.drawDate);
  const formattedDate = drawDateObj.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shareText = `🏆 ¡Tenemos ganador oficial en la rifa de ${raffle.title}! Número ganador: #${raffle.winnerTicket || '000'}, Ganador: ${raffle.winnerName || 'N/A'}. Ver resultado en: ${typeof window !== 'undefined' ? window.location.href : ''}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href={`/rifa/${raffle.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a los detalles de la rifa</span>
        </Link>
      </div>

      {/* Main Golden Card */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-12 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden space-y-8">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Trophy icon */}
        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 mx-auto flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-pulse-glow">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Resultado Oficial y Verificado
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            🏆 ¡TENEMOS GANADOR!
          </h1>
        </div>

        {/* Prize Box */}
        <div className="relative z-10 max-w-xl mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-5 text-left">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900">
            <Image
              src={raffle.imageUrl}
              alt={raffle.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Premio Sorteado:</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-white">
              {raffle.title}
            </h3>
            <p className="text-xs text-slate-400">
              Valor del boleto: {raffle.currency}{raffle.pricePerTicket.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Winning Ticket Highlight Box */}
        <div className="relative z-10 max-w-md mx-auto space-y-4">
          
          {/* Giant Winning Number Ticket */}
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-1 rounded-3xl shadow-xl shadow-amber-500/20">
            <div className="bg-slate-950 rounded-[22px] py-6 px-8 text-center space-y-1">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
                Número Ganador
              </span>
              <div className="font-mono font-black text-5xl sm:text-6xl text-amber-400 tracking-wider">
                #{raffle.winnerTicket || '450'}
              </div>
            </div>
          </div>

          {/* Winner Details */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3 text-left">
            <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-800/80 pb-2.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                Ganador Oficial:
              </span>
              <span className="font-bold text-white text-base">
                {raffle.winnerName || 'Juan Carlos Pérez'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                Fecha del Sorteo:
              </span>
              <span className="font-semibold text-slate-200">
                {formattedDate}
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto btn-glow-emerald flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-display text-sm active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>Compartir en WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? '¡Enlace Copiado!' : 'Copiar Resultado'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
