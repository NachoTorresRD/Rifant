'use client';

import React, { useState, useMemo } from 'react';
import { Search, Shuffle, Check, Lock, X, Sparkles, Filter } from 'lucide-react';
import { Ticket } from '@/lib/types';

interface TicketGridProps {
  tickets: Ticket[];
  selectedNumbers: string[];
  onToggleNumber: (num: string) => void;
  onSelectRandom: (count: number) => void;
  onClearSelection: () => void;
  pricePerTicket: number;
  currency: string;
}

export default function TicketGrid({
  tickets,
  selectedNumbers,
  onToggleNumber,
  onSelectRandom,
  onClearSelection,
  pricePerTicket,
  currency,
}: TicketGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'selected' | 'sold'>('all');

  // Filtered tickets based on search and tab
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search term filter
      if (searchTerm.trim()) {
        if (!ticket.number.includes(searchTerm.trim())) {
          return false;
        }
      }

      // Tab filter
      if (activeFilter === 'available') {
        return ticket.status === 'AVAILABLE' && !selectedNumbers.includes(ticket.number);
      }
      if (activeFilter === 'selected') {
        return selectedNumbers.includes(ticket.number);
      }
      if (activeFilter === 'sold') {
        return ticket.status === 'SOLD';
      }

      return true;
    });
  }, [tickets, searchTerm, activeFilter, selectedNumbers]);

  return (
    <div className="w-full space-y-6">
      
      {/* Legend & Quick Pickers Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-4">
        
        {/* Status Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            Estados de boletos:
          </span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500 shadow-sm" />
              <span className="text-emerald-400">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400 border border-amber-300 shadow-sm shadow-amber-400/30" />
              <span className="text-amber-400 font-bold">Seleccionado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-950/60 border border-rose-800 text-rose-500 flex items-center justify-center text-[9px]" />
              <span className="text-rose-400">Vendido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-[9px]">
                <Lock className="w-2.5 h-2.5 text-slate-400" />
              </span>
              <span className="text-slate-400">Reservado</span>
            </div>
          </div>
        </div>

        {/* Quick Pick Express Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Selección rápida:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectRandom(1)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-400/50 active:scale-95 transition-all flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>1 al azar</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRandom(5)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-400/50 active:scale-95 transition-all flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>5 al azar</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRandom(10)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-400/50 active:scale-95 transition-all flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>10 al azar</span>
            </button>

            {selectedNumbers.length > 0 && (
              <button
                type="button"
                onClick={onClearSelection}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 active:scale-95 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Limpiar ({selectedNumbers.length})</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar número específico (ej: 025)..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('available')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeFilter === 'available'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Disponibles
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('selected')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeFilter === 'selected'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Elegidos ({selectedNumbers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('sold')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeFilter === 'sold'
                ? 'bg-rose-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vendidos
          </button>
        </div>

      </div>

      {/* Tickets Grid */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-h-[560px] overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Filter className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">
              No se encontraron números con ese filtro o búsqueda.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="text-xs text-amber-400 font-bold hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedNumbers.includes(ticket.number);
              const isAvailable = ticket.status === 'AVAILABLE';
              const isSold = ticket.status === 'SOLD';
              const isReserved = ticket.status === 'RESERVED';

              if (isSelected) {
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => onToggleNumber(ticket.number)}
                    className="relative aspect-square flex flex-col items-center justify-center rounded-xl font-mono font-black text-xs sm:text-sm bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-amber-400/30 scale-105 border-2 border-yellow-200 active:scale-95 transition-all z-10"
                    title={`Número #${ticket.number} (Seleccionado)`}
                  >
                    <span>#{ticket.number}</span>
                    <Check className="w-3 h-3 -mt-0.5 stroke-[3]" />
                  </button>
                );
              }

              if (isAvailable) {
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => onToggleNumber(ticket.number)}
                    className="aspect-square flex items-center justify-center rounded-xl font-mono font-bold text-xs sm:text-sm bg-emerald-950/30 text-emerald-300 border border-emerald-600/40 hover:border-emerald-400 hover:bg-emerald-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20"
                    title={`Número #${ticket.number} disponible`}
                  >
                    #{ticket.number}
                  </button>
                );
              }

              if (isSold) {
                return (
                  <div
                    key={ticket.id}
                    className="aspect-square flex items-center justify-center rounded-xl font-mono text-xs sm:text-sm bg-rose-950/20 text-rose-700/60 border border-rose-900/30 cursor-not-allowed select-none line-through"
                    title={`Número #${ticket.number} ya vendido`}
                  >
                    #{ticket.number}
                  </div>
                );
              }

              // Reserved
              return (
                <div
                  key={ticket.id}
                  className="relative aspect-square flex flex-col items-center justify-center rounded-xl font-mono text-[10px] sm:text-xs bg-slate-900/70 text-slate-500 border border-slate-800 cursor-not-allowed select-none"
                  title={`Número #${ticket.number} reservado temporalmente`}
                >
                  <Lock className="w-3 h-3 text-slate-500 mb-0.5" />
                  <span>#{ticket.number}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
