'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, Crown, Calendar, Clock, Sparkles, Check, FileText, Sun, Moon } from 'lucide-react';
import { Raffle, Ticket } from '@/lib/types';

interface PrintTicketsClientViewProps {
  raffle: Raffle;
  tickets: Ticket[];
}

export default function PrintTicketsClientView({
  raffle,
  tickets,
}: PrintTicketsClientViewProps) {
  const [startNumber, setStartNumber] = useState(1);
  const [ticketsCount, setTicketsCount] = useState(raffle.totalTickets); // Defaults to ALL TICKETS!
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [printMode, setPrintMode] = useState<'light' | 'dark'>('light'); // Default to light/printer-friendly to prevent white-on-white blank tickets

  // Tickets slice to render for print
  const selectedTickets = tickets.slice(startNumber - 1, startNumber - 1 + ticketsCount);
  const sheetsCount = Math.ceil(selectedTickets.length / 8);

  const drawDate = new Date(raffle.drawDate);
  const formattedDate = drawDate.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  const handlePrintAll = () => {
    setStartNumber(1);
    setTicketsCount(tickets.length);
    setIsAllSelected(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleSelectBatch = (start: number, count: number) => {
    setStartNumber(start);
    setTicketsCount(count);
    setIsAllSelected(count === tickets.length);
  };

  const isLight = printMode === 'light';

  return (
    <div className="min-h-screen pb-20">
      
      {/* ================= INLINE PRINT STYLES ================= */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 5mm 5mm 5mm 5mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-ticket-item {
            height: 63mm !important;
            max-height: 63mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-grid-container {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 2.5mm !important;
          }
          header, footer, nav, .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* ================= TOP CONTROL DASHBOARD (HIDDEN ON PRINT) ================= */}
      <div className="print:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/rifas/${raffle.id}/boletos`}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Volver a lista de boletos"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Talonarios de Imprenta (2×4 = 8 Boletos por Hoja)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {tickets.length} Boletos Disponibles
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black font-display text-white">
                  Impresor Oficial: {raffle.title}
                </h1>
              </div>
            </div>

            {/* GIANT DOMINANT BUTTON: IMPRIMIR TODOS LOS BOLETOS */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrintAll}
                className="btn-glow-gold flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black font-display text-sm tracking-wide shadow-2xl shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <Printer className="w-5 h-5 stroke-[2.5]" />
                <span>🖨️ IMPRIMIR TODOS LOS BOLETOS (1 al {raffle.totalTickets})</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Imprimir Selección ({selectedTickets.length} boletos)</span>
              </button>
            </div>
          </div>

          {/* PRINT THEME & BATCH SELECTOR */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Batch Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold mr-1">Lotes rápidos:</span>
              
              <button
                type="button"
                onClick={() => handleSelectBatch(1, tickets.length)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  isAllSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                ✓ Todos (1 al {tickets.length}) - {Math.ceil(tickets.length / 8)} hojas
              </button>

              <button
                type="button"
                onClick={() => handleSelectBatch(1, Math.min(100, tickets.length))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium hover:bg-slate-700"
              >
                Lote 1 (1 al 100) - 13 hojas
              </button>

              {tickets.length >= 200 && (
                <button
                  type="button"
                  onClick={() => handleSelectBatch(101, 100)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium hover:bg-slate-700"
                >
                  Lote 2 (101 al 200) - 13 hojas
                </button>
              )}

              {tickets.length >= 300 && (
                <button
                  type="button"
                  onClick={() => handleSelectBatch(201, 100)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium hover:bg-slate-700"
                >
                  Lote 3 (201 al 300) - 13 hojas
                </button>
              )}
            </div>

            {/* Print Mode Selector & Custom Range */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Print Theme Toggle */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPrintMode('light')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isLight
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fondo blanco con líneas oscuras nítidas, ideal para impresoras convencionales"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Fondo Blanco Nítido (Recomendado)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('dark')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    !isLight
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fondo negro y dorado estilo VIP"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Fondo Negro VIP</span>
                </button>
              </div>

              {/* Custom Range Inputs */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl">
                <span className="text-slate-400 text-[11px]">Desde:</span>
                <input
                  type="number"
                  min="1"
                  max={tickets.length}
                  value={startNumber}
                  onChange={(e) => {
                    setStartNumber(Math.max(1, Number(e.target.value)));
                    setIsAllSelected(false);
                  }}
                  className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center font-bold"
                />
                <span className="text-slate-400 text-[11px]">Cantidad:</span>
                <input
                  type="number"
                  min="1"
                  max={tickets.length}
                  value={ticketsCount}
                  onChange={(e) => {
                    setTicketsCount(Math.max(1, Number(e.target.value)));
                    setIsAllSelected(false);
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center font-bold"
                />
                <span className="text-amber-400 font-bold text-[11px] ml-1">
                  = {sheetsCount} {sheetsCount === 1 ? 'hoja' : 'hojas'}
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ================= PRINTABLE SHEETS CANVAS ================= */}
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 print:p-0 print:m-0 print:max-w-none">
        
        {/* Helper Notice for on-screen view */}
        <div className="print:hidden bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            Mostrando <strong className="text-amber-400">{selectedTickets.length} boletos</strong> ({sheetsCount} hojas en total). 
            Cada hoja contiene 8 boletos (2 columnas × 4 filas) con imagen nítida, líneas de corte troqueladas y talón desprendible con campo para Cédula.
          </div>
          <button
            type="button"
            onClick={handlePrintAll}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 self-start sm:self-auto"
          >
            🖨️ Mandar a Imprimir Ahora
          </button>
        </div>

        {/* 2 Columns x N Rows grid */}
        <div className="print-grid-container grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-1.5">
          {selectedTickets.map((t) => (
            <div
              key={t.id}
              className={`print-ticket-item relative rounded-2xl border-2 overflow-hidden flex flex-row shadow-md print:rounded-lg print:shadow-none print:break-inside-avoid h-[178px] sm:h-[185px] transition-colors ${
                isLight
                  ? 'bg-white text-slate-950 border-amber-600 print:border-amber-600 print:bg-white print:text-slate-950'
                  : 'bg-black text-white border-amber-500/80 print:border-amber-600 print:bg-black print:text-white'
              }`}
            >
              
              {/* Left Body */}
              <div
                className={`flex-1 p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 relative ${
                  isLight ? 'bg-white' : 'bg-[#0a0d14]'
                }`}
              >
                
                {/* Prize Image (Eager loading so it never prints blank!) */}
                <div
                  className={`relative w-20 h-28 sm:w-24 sm:h-36 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center ${
                    isLight
                      ? 'bg-slate-50 border-amber-600/40 shadow-sm'
                      : 'bg-slate-900 border-amber-500/40'
                  }`}
                >
                  <img
                    src={raffle.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop'}
                    alt={raffle.title}
                    loading="eager"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 print:hidden ${
                      isLight
                        ? 'bg-gradient-to-t from-black/20 to-transparent'
                        : 'bg-gradient-to-t from-black/60 to-transparent'
                    }`}
                  />
                </div>

                {/* Info and Badges */}
                <div className="flex-1 flex flex-col justify-between h-full py-0.5 space-y-1">
                  <div>
                    {/* Top Row with Crown and CLIENT TICKET NUMBER (Doble Numeración) */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Crown
                          className={`w-3.5 h-3.5 fill-amber-500 stroke-amber-700 ${
                            isLight ? 'text-amber-700' : 'text-amber-400'
                          }`}
                        />
                        <span
                          className={`text-[9px] font-black tracking-wider uppercase ${
                            isLight ? 'text-amber-700' : 'text-amber-400'
                          }`}
                        >
                          RIFA OFICIAL
                        </span>
                      </div>

                      {/* DOBLE NUMERACIÓN: Número en el cuerpo que se lleva el cliente */}
                      <div className="bg-red-600 text-white font-mono font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md border border-red-500 shadow-sm shrink-0">
                        BOLETO N° {t.number}
                      </div>
                    </div>

                    {/* Dynamic Title (No longer hardcoded!) */}
                    <h3
                      className={`text-xs sm:text-sm font-black font-display leading-tight line-clamp-1 mt-0.5 ${
                        isLight ? 'text-slate-950 font-black' : 'text-white'
                      }`}
                      title={raffle.title}
                    >
                      {raffle.title.replace(/^🎁\s*/, '')}
                    </h3>

                    <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider">
                      ¡TUYO PUEDE SER!
                    </div>
                  </div>

                  {/* Dynamic Price & Promo Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black text-[9px] leading-tight shadow-sm">
                      <span className="block text-[7px] uppercase font-bold opacity-80">VALOR BOLETO</span>
                      <span>{raffle.currency}{raffle.pricePerTicket}</span>
                    </div>

                    {(raffle.promoText || raffle.comboQty) && (
                      <div className="bg-red-600 text-white px-2 py-0.5 rounded-md font-black text-[9px] leading-tight shadow-sm">
                        <span className="block text-[7px] uppercase font-bold opacity-90">OFERTA</span>
                        <span>{raffle.promoText || `${raffle.comboQty} BOLETOS POR ${raffle.currency}${raffle.comboPrice}`}</span>
                      </div>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div
                    className={`text-[8px] sm:text-[9px] font-bold space-y-0.5 pt-0.5 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-amber-600" />
                      <span>FECHA: {formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>HORA: {raffle.drawTime || '08:00 P.M.'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[8px] font-bold italic ${
                        isLight ? 'text-amber-800' : 'text-amber-400'
                      }`}
                    >
                      ¡No te quedes sin el tuyo!
                    </p>
                    <span className="text-[7px] font-bold uppercase text-slate-400">
                      Boleto del Cliente
                    </span>
                  </div>
                </div>

              </div>

              {/* Perforated separator with cut guide */}
              <div className="relative flex flex-col items-center justify-between my-1 px-0.5">
                <div
                  className={`w-3 h-3 rounded-full -mt-2.5 border-b border-amber-500 ${
                    isLight ? 'bg-slate-100 print:bg-white' : 'bg-white'
                  }`}
                />
                <span className="text-[7px] font-mono font-black text-slate-400 select-none tracking-tighter uppercase my-auto rotate-90 whitespace-nowrap">
                  ✂ CORTE
                </span>
                <div
                  className={`w-0 flex-1 border-r-2 border-dashed my-0.5 ${
                    isLight ? 'border-slate-400' : 'border-amber-500/60'
                  }`}
                />
                <div
                  className={`w-3 h-3 rounded-full -mb-2.5 border-t border-amber-500 ${
                    isLight ? 'bg-slate-100 print:bg-white' : 'bg-white'
                  }`}
                />
              </div>

              {/* Right Stub (Talón Desprendible para la Urna) */}
              <div
                className={`w-36 sm:w-44 p-2 sm:p-2.5 flex flex-col justify-between relative border-l ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 print:bg-white print:border-slate-300'
                    : 'bg-[#0a0d14] border-slate-800'
                }`}
              >
                {/* Header with TALÓN URNA and MATCHING TICKET NUMBER (Doble Numeración) */}
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[8px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      TALÓN URNA
                    </span>
                    <div className="bg-white text-red-600 font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-lg border-2 border-red-600 shadow-sm">
                      N° {t.number}
                    </div>
                  </div>
                  <div className={`text-[8px] font-bold truncate mt-0.5 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                    {raffle.title.replace(/^🎁\s*/, '')}
                  </div>
                </div>

                <div className="space-y-1 text-[8px] sm:text-[9px]">
                  <div>
                    <span
                      className={`block font-bold ${
                        isLight ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      Nombre del cliente:
                    </span>
                    <div
                      className={`w-full border-b-2 h-4 font-bold text-[9px] truncate ${
                        isLight
                          ? 'border-slate-900 text-slate-950'
                          : 'border-white/60 text-white'
                      }`}
                    >
                      {t.customerName || ''}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`block font-bold ${
                        isLight ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      Teléfono:
                    </span>
                    <div
                      className={`w-full border-b-2 h-4 font-mono font-bold text-[9px] truncate ${
                        isLight
                          ? 'border-slate-900 text-slate-950'
                          : 'border-white/60 text-white'
                      }`}
                    >
                      {t.customerPhone || ''}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`block font-bold ${
                        isLight ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      Cédula:
                    </span>
                    <div
                      className={`w-full border-b-2 h-4 font-mono font-bold text-[9px] truncate ${
                        isLight
                          ? 'border-slate-900 text-slate-950'
                          : 'border-white/60 text-white'
                      }`}
                    >
                      {t.customerCedula || ''}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-right text-[8px] font-bold italic pt-0.5 ${
                    isLight ? 'text-amber-800' : 'text-amber-300'
                  }`}
                >
                  ¡Gracias por participar! ❤️
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

