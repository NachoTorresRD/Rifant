'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Crown, Calendar, Clock, QrCode, Download, Share2, Check, Sparkles } from 'lucide-react';
import { Raffle } from '@/lib/types';

interface DigitalTicketCardProps {
  raffle: Raffle;
  ticketNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerCedula?: string;
  isOfficial?: boolean;
}

export default function DigitalTicketCard({
  raffle,
  ticketNumber,
  customerName,
  customerPhone,
  customerCedula,
  isOfficial = true,
}: DigitalTicketCardProps) {
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const drawDate = new Date(raffle.drawDate);
  const formattedDate = drawDate.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🎟️ ¡Mira mi Boleto Digital Oficial #${ticketNumber} para la ${raffle.title}! Nombre: ${customerName || ''}, Cédula: ${customerCedula || ''}. Sorteo: ${formattedDate}.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      
      {/* THE DIGITAL VIP TICKET CONTAINER */}
      <div
        ref={ticketRef}
        className="relative bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-[3px] rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden"
      >
        <div className="relative bg-[#0a0d14] text-white rounded-[22px] flex flex-col md:flex-row overflow-hidden border border-amber-500/40">
          
          {/* Subtle background golden flare */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

          {/* ================= LEFT / MAIN BODY ================= */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center relative z-10">
            
            {/* Prize Image (iPhone with glow) */}
            <div className="relative w-28 h-36 sm:w-36 sm:h-44 shrink-0 rounded-2xl overflow-hidden bg-slate-900/90 border border-amber-500/30 shadow-lg group">
              <Image
                src={raffle.imageUrl}
                alt={raffle.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-0 right-0 text-center">
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
                  OFICIAL
                </span>
              </div>
            </div>

            {/* Content & Promotional Badges */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              
              {/* Crown & Title with DOBLE NUMERACIÓN */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-400">
                    <Crown className="w-5 h-5 fill-amber-400 stroke-slate-950 animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                      Sorteo Exclusivo
                    </span>
                  </div>

                  {/* DOBLE NUMERACIÓN: Número visible para el cliente */}
                  <div className="bg-red-600 text-white font-mono font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-md border border-red-400/40 w-fit mx-auto sm:mx-0">
                    BOLETO N° {ticketNumber}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white drop-shadow-md">
                  RIFA {raffle.title.replace(/^🎁\s*/, '')}
                </h3>
                <div className="inline-block mt-0.5 px-3 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
                  ¡TUYO PUEDE SER!
                </div>
              </div>

              {/* Price & Offer Badges (Identical to physical ticket) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black px-3 py-1 rounded-xl shadow-md text-xs">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold opacity-80 -mb-0.5">
                    VALOR DEL BOLETO
                  </span>
                  <span className="text-sm font-display">
                    {raffle.currency}{raffle.pricePerTicket}
                  </span>
                </div>

                {raffle.promoText && (
                  <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white font-black px-3 py-1 rounded-xl shadow-md text-xs border border-red-400/40">
                    <span className="block text-[9px] uppercase tracking-wider font-extrabold opacity-90 -mb-0.5">
                      OFERTA ESPECIAL
                    </span>
                    <span className="text-sm font-display">
                      {raffle.promoText}
                    </span>
                  </div>
                )}
              </div>

              {/* Date, Time & Footer Motto */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>FECHA: <strong>{formattedDate}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>HORA: <strong>{raffle.drawTime || '08:00 P.M.'}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-amber-400 italic">
                  ¡No te quedes sin el tuyo!
                </p>
                <span className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">
                  Boleto del Cliente
                </span>
              </div>

            </div>

          </div>

          {/* ================= PERFORATED LINE ================= */}
          <div className="relative hidden md:flex flex-col items-center justify-between my-2">
            {/* Top Cutout notch */}
            <div className="w-5 h-5 rounded-full bg-slate-950 -mt-3.5 border-b border-amber-500/50" />
            
            {/* Dashed vertical separator */}
            <div className="w-0 flex-1 border-r-2 border-dashed border-amber-500/40 my-1 flex items-center justify-center">
              <span className="text-[8px] font-mono font-bold uppercase text-slate-500 -rotate-90 select-none whitespace-nowrap">
                ✂ CORTE
              </span>
            </div>
            
            {/* Bottom Cutout notch */}
            <div className="w-5 h-5 rounded-full bg-slate-950 -mb-3.5 border-t border-amber-500/50" />
          </div>

          {/* Horizontal cutout for small screens */}
          <div className="relative md:hidden flex items-center justify-between mx-2 my-0">
            <div className="w-5 h-5 rounded-full bg-slate-950 -ml-4 border-r border-amber-500/50" />
            <div className="h-0 flex-1 border-b-2 border-dashed border-amber-500/40 mx-1" />
            <div className="w-5 h-5 rounded-full bg-slate-950 -mr-4 border-l border-amber-500/50" />
          </div>

          {/* ================= RIGHT / STUB SECTION (TALÓN) ================= */}
          <div className="w-full md:w-64 bg-[#0e121d] p-4 sm:p-5 flex flex-col justify-between space-y-3 relative z-10 border-t md:border-t-0 md:border-l border-slate-800">
            
            {/* Big Ticket Number Header with TALÓN DE URNA */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                TALÓN DE URNA
              </span>
              <div className="bg-red-600 text-white font-mono font-black text-sm sm:text-base px-3 py-1 rounded-xl shadow-md border border-red-400/40">
                N° {ticketNumber}
              </div>
            </div>

            {/* Customer Details Stub Box */}
            <div className="bg-black/60 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Nombre del cliente:</span>
                <span className="font-bold text-white text-xs truncate block">
                  {customerName || 'Pendiente de asignar'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Teléfono:</span>
                <span className="font-mono text-amber-400 font-semibold text-xs block">
                  {customerPhone || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Cédula:</span>
                <span className="font-mono text-slate-200 font-semibold text-xs block">
                  {customerCedula || 'Sin cédula'}
                </span>
              </div>
            </div>

            {/* Verification & Footer Love */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-amber-300 font-bold italic">
                ¡Gracias por participar! ❤️
              </div>
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm" title="Código de validación">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="btn-glow-emerald flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Compartir Boleto por WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Imprimir / Guardar en PDF</span>
        </button>
      </div>

    </div>
  );
}
