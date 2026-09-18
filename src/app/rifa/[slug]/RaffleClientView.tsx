'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, Flame, Ticket as TicketIcon, Share2, 
  ShieldCheck, HelpCircle, Trophy, Sparkles, RefreshCw,
  MessageCircle, ArrowLeft, Tag, Crown, Eye, Clock, Check, Copy, Zap
} from 'lucide-react';
import { Raffle, Ticket, RaffleStats } from '@/lib/types';
import TicketGrid from '@/components/TicketGrid';
import FloatingCartBar from '@/components/FloatingCartBar';
import ReservationModal from '@/components/ReservationModal';
import ShareModal from '@/components/ShareModal';
import DigitalTicketCard from '@/components/DigitalTicketCard';

interface RaffleClientViewProps {
  initialRaffle: Raffle;
  initialStats: RaffleStats;
  initialTickets: Ticket[];
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isOver) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>¡El sorteo está programado para hoy en vivo!</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-3 sm:p-4 text-center space-y-2 shadow-xl shadow-amber-500/5">
      <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>⏳ Tiempo Restante para el Sorteo Oficial</span>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
          <span className="block text-xl sm:text-2xl font-black font-display text-white">{timeLeft.days}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Días</span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
          <span className="block text-xl sm:text-2xl font-black font-display text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Horas</span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
          <span className="block text-xl sm:text-2xl font-black font-display text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Min</span>
        </div>
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-2 text-center bg-amber-500/5">
          <span className="block text-xl sm:text-2xl font-black font-display text-amber-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Seg</span>
        </div>
      </div>
    </div>
  );
}

export default function RaffleClientView({
  initialRaffle,
  initialStats,
  initialTickets,
}: RaffleClientViewProps) {
  const [raffle, setRaffle] = useState<Raffle>(initialRaffle);
  const [stats, setStats] = useState<RaffleStats>(initialStats);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTicketPreviewOpen, setIsTicketPreviewOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const refreshTickets = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ticketsRes, raffleRes] = await Promise.all([
        fetch(`/api/raffles/${raffle.slug}/tickets`),
        fetch(`/api/raffles/${raffle.slug}`),
      ]);

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        if (data.success) {
          setTickets(data.tickets);
          const takenNumbers = new Set(
            data.tickets
              .filter((t: Ticket) => t.status !== 'AVAILABLE')
              .map((t: Ticket) => t.number)
          );
          setSelectedNumbers((prev) => prev.filter((num) => !takenNumbers.has(num)));
        }
      }

      if (raffleRes.ok) {
        const data = await raffleRes.json();
        if (data.success) {
          setRaffle(data.raffle);
          if (data.raffle.stats) {
            setStats(data.raffle.stats);
          }
        }
      }
    } catch (err) {
      console.error('Error refreshing raffle data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [raffle.slug]);

  useEffect(() => {
    const interval = setInterval(refreshTickets, 15000);
    return () => clearInterval(interval);
  }, [refreshTickets]);

  const handleToggleNumber = (num: string) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      } else {
        return [...prev, num];
      }
    });
  };

  const handleSelectRandom = (count: number) => {
    const available = tickets.filter(
      (t) => t.status === 'AVAILABLE' && !selectedNumbers.includes(t.number)
    );

    if (available.length === 0) return;

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((t) => t.number);

    setSelectedNumbers((prev) => [...prev, ...picked]);
  };

  const handleClearSelection = () => {
    setSelectedNumbers([]);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const drawDateObj = new Date(raffle.drawDate);
  const formattedDrawDate = drawDateObj.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isFinished = raffle.status === 'FINISHED';
  const startNumber = '0'.repeat(raffle.digitsCount);
  const endNumber = (raffle.totalTickets - 1).toString().padStart(raffle.digitsCount, '0');

  return (
    <div className="min-h-screen pb-32">
      
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a todas las rifas</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTicketPreviewOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/40 transition-all text-xs flex items-center gap-1.5"
            title="Ver diseño del boleto"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Ver Boleto VIP</span>
          </button>

          <button
            type="button"
            onClick={refreshTickets}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs flex items-center gap-1.5"
            title="Actualizar estado de boletos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="btn-glow px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 space-y-8">
        
        {/* HERO PRIZE CARD WITH VIBRANT VISUALS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Subtle gold glow behind card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* BIG PRIZE IMAGE */}
            <div className="lg:col-span-6 relative aspect-[16/11] lg:aspect-auto w-full min-h-[320px] sm:min-h-[440px] bg-slate-950 overflow-hidden">
              <Image
                src={raffle.imageUrl}
                alt={raffle.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-900" />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950/90 backdrop-blur-md text-amber-400 border border-amber-500/40 shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {raffle.category}
                </span>
                {raffle.promoText && (
                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-lg border border-red-400/30 animate-pulse">
                    🔥 {raffle.promoText}
                  </span>
                )}
                {isFinished && (
                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-lg">
                    🏆 Sorteada
                  </span>
                )}
              </div>

              {/* Floating Quick Price pill on image (mobile view) */}
              <div className="absolute bottom-4 left-4 lg:hidden">
                <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Boleto:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-amber-400 font-display">
                      {raffle.currency}{raffle.pricePerTicket.toLocaleString()}
                    </span>
                    {raffle.promoText && (
                      <span className="text-[10px] text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded-md">
                        {raffle.promoText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PRIZE DETAILS & STATS */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                
                {/* Title */}
                <div>
                  <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Sorteo Oficial Digital y Físico Certificado</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white leading-tight">
                    {raffle.title}
                  </h1>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {raffle.description}
                </p>

                {/* COUNTDOWN TIMER */}
                {!isFinished && <CountdownTimer targetDate={raffle.drawDate} />}

                {/* Key specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  
                  {/* Price */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                    <span className="text-[11px] text-slate-400 font-medium block">
                      💰 Precio x Boleto
                    </span>
                    <span className="text-lg sm:text-xl font-black font-display text-amber-400">
                      {raffle.currency}{raffle.pricePerTicket.toLocaleString()}
                    </span>
                    {raffle.promoText && (
                      <span className="text-[10px] text-red-400 font-bold block mt-0.5">
                        {raffle.promoText}
                      </span>
                    )}
                  </div>

                  {/* Numbers range */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                    <span className="text-[11px] text-slate-400 font-medium block">
                      🎟️ Números
                    </span>
                    <span className="text-lg sm:text-xl font-black font-mono text-slate-200">
                      {startNumber} al {endNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {raffle.totalTickets} en juego
                    </span>
                  </div>

                  {/* Available count */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 font-medium block">
                      🔥 Quedan Solo
                    </span>
                    <span className="text-lg sm:text-xl font-black font-display text-emerald-400">
                      {stats.availableTickets} boletos
                    </span>
                  </div>

                </div>

                {/* Draw Date Info */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-amber-300">
                  <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold block text-white">Día del Sorteo:</span>
                    <span className="text-amber-400 font-bold">
                      {formattedDrawDate} {raffle.drawTime ? `• ${raffle.drawTime}` : ''}
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      Progreso de venta ({stats.percentageSold}% vendido):
                    </span>
                    <span className="font-bold text-amber-400">
                      {stats.soldTickets} de {stats.totalTickets} números
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-700 shadow-md shadow-amber-500/30"
                      style={{ width: `${Math.min(stats.percentageSold, 100)}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* VIRAL SOCIAL SHARE BAR */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* WhatsApp Direct Share Button */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🎟️ ¡GANA: ${raffle.title}! Por solo ${raffle.currency}${raffle.pricePerTicket}. Elige tu número de la suerte aquí: ${
                        typeof window !== 'undefined' ? window.location.href : ''
                      }`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Compartir en WhatsApp</span>
                  </a>

                  {/* Copy Link for TikTok / IG Bio */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">¡Copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar para TikTok / IG</span>
                      </>
                    )}
                  </button>

                </div>
              </div>

            </div>

          </div>
        </div>

        {/* WINNER BANNER IF ALREADY FINISHED */}
        {isFinished && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              <Trophy className="w-4 h-4" />
              Sorteo Finalizado
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              ¡Este sorteo ya tiene un ganador oficial!
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Número premiado: <span className="text-amber-400 font-mono font-bold text-base">#{raffle.winnerTicket}</span> a nombre de <span className="text-white font-bold">{raffle.winnerName}</span>.
            </p>
            <div className="pt-2">
              <Link
                href={`/rifa/${raffle.slug}/ganador`}
                className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
              >
                <span>Ver Pantalla Oficial de Ganador</span>
              </Link>
            </div>
          </div>
        )}

        {/* INTERACTIVE NUMBER SELECTOR SECTION */}
        {!isFinished && (
          <section className="space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2.5">
                  <TicketIcon className="w-7 h-7 text-amber-400" />
                  <span>Elige tus Números de la Suerte</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Toca cualquier número disponible para agregarlo a tu carrito. {raffle.promoText ? `¡Aprovecha: ${raffle.promoText}!` : ''}
                </p>
              </div>

              {raffle.promoText && (
                <div className="self-start sm:self-auto bg-gradient-to-r from-red-600 to-rose-600 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-red-600/20 border border-red-400/30 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{raffle.promoText}</span>
                </div>
              )}
            </div>

            {/* Grid Component */}
            <TicketGrid
              tickets={tickets}
              selectedNumbers={selectedNumbers}
              onToggleNumber={handleToggleNumber}
              onSelectRandom={handleSelectRandom}
              onClearSelection={handleClearSelection}
              pricePerTicket={raffle.pricePerTicket}
              currency={raffle.currency}
            />
          </section>
        )}

      </div>

      {/* FLOATING STICKY CART BAR (MOBILE FIRST) WITH COMBO PRICING */}
      {!isFinished && (
        <FloatingCartBar
          raffle={raffle}
          selectedNumbers={selectedNumbers}
          pricePerTicket={raffle.pricePerTicket}
          currency={raffle.currency}
          onOpenReservation={() => setIsReservationOpen(true)}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* RESERVATION CHECKOUT MODAL */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        raffle={raffle}
        selectedNumbers={selectedNumbers}
        onReservationSuccess={() => {
          refreshTickets();
        }}
      />

      {/* DIGITAL TICKET DESIGN PREVIEW MODAL */}
      {isTicketPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsTicketPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" />
                Modelo Oficial de Boleto Físico y Digital
              </div>
              <h3 className="text-2xl font-black font-display text-white">
                Así se verá tu Boleto Digital
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Incluye talón desprendible con tus datos, número asignado, Cédula y código QR de validación.
              </p>
            </div>

            <DigitalTicketCard
              raffle={raffle}
              ticketNumber={startNumber}
              customerName="Juan Pérez"
              customerPhone="809-555-0000"
              customerCedula="001-1234567-8"
            />
          </div>
        </div>
      )}

      {/* SOCIAL SHARE MODAL */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        raffle={raffle}
      />

    </div>
  );
}
