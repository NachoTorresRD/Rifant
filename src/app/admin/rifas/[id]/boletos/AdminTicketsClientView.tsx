'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, Lock, CheckCircle, 
  X, Phone, User, Calendar, DollarSign, Clock, RefreshCw, MessageSquare,
  Printer, CreditCard, Tag, Download, LayoutGrid, List, Globe, Store, ShieldCheck
} from 'lucide-react';
import { Raffle, Ticket, TicketStatus } from '@/lib/types';

interface AdminTicketsClientViewProps {
  raffle: Raffle;
  initialTickets: Ticket[];
}

export default function AdminTicketsClientView({
  raffle,
  initialTickets,
}: AdminTicketsClientViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AVAILABLE' | 'RESERVED' | 'SOLD'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'DIGITAL' | 'PHYSICAL'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Selected ticket for modal inspection
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalCustomerName, setModalCustomerName] = useState('');
  const [modalCustomerPhone, setModalCustomerPhone] = useState('');
  const [modalCustomerCedula, setModalCustomerCedula] = useState('');
  const [modalChannel, setModalChannel] = useState<'DIGITAL' | 'PHYSICAL'>('DIGITAL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Counts
  const counts = useMemo(() => {
    let available = 0;
    let reserved = 0;
    let sold = 0;
    let digital = 0;
    let physical = 0;
    tickets.forEach((t) => {
      if (t.status === 'AVAILABLE') available++;
      else if (t.status === 'RESERVED') reserved++;
      else if (t.status === 'SOLD') {
        sold++;
        if (t.channel === 'PHYSICAL') physical++;
        else digital++;
      }
    });
    return { available, reserved, sold, digital, physical, total: tickets.length };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesNum = t.number.includes(query);
        const matchesName = t.customerName?.toLowerCase().includes(query);
        const matchesPhone = t.customerPhone?.includes(query);
        const matchesCedula = t.customerCedula?.toLowerCase().includes(query);
        if (!matchesNum && !matchesName && !matchesPhone && !matchesCedula) return false;
      }

      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }

      if (channelFilter !== 'all') {
        const ch = t.channel || 'DIGITAL';
        if (ch !== channelFilter) return false;
      }

      return true;
    });
  }, [tickets, searchTerm, statusFilter, channelFilter]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Boleto', 'Estado', 'Canal', 'Cliente', 'Telefono', 'Cedula', 'Ultima_Actualizacion'];
    const rows = filteredTickets.map((t) => [
      `"${t.number}"`,
      `"${t.status}"`,
      `"${t.channel || 'DIGITAL'}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${(t.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(t.customerCedula || '').replace(/"/g, '""')}"`,
      `"${t.updatedAt || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participantes_${raffle.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open inspector modal
  const handleOpenInspector = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalCustomerName(ticket.customerName || '');
    setModalCustomerPhone(ticket.customerPhone || '');
    setModalCustomerCedula(ticket.customerCedula || '');
    setModalChannel(ticket.channel || 'DIGITAL');
    setUpdateMsg('');
  };

  // Update ticket status
  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    setUpdateMsg('');

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: raffle.id,
          number: selectedTicket.number,
          newStatus,
          customerName: newStatus === 'AVAILABLE' ? null : modalCustomerName,
          customerPhone: newStatus === 'AVAILABLE' ? null : modalCustomerPhone,
          customerCedula: newStatus === 'AVAILABLE' ? null : modalCustomerCedula,
          channel: modalChannel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar boleto');
      }

      setTickets((prev) =>
        prev.map((t) => (t.number === selectedTicket.number ? data.ticket : t))
      );
      setSelectedTicket(data.ticket);
      setUpdateMsg('¡Boleto actualizado correctamente!');
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Link>

        {/* TOP BUTTON ACTIONS: PRINT ALL TICKETS & EXPORT CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 active:scale-95 transition-all"
            title="Descargar lista de boletos y clientes en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar a CSV ({filteredTickets.length})</span>
          </button>

          <Link
            href={`/admin/rifas/${raffle.id}/imprimir`}
            className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Imprimir Talonario Completo</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Gestión Físico + Digital
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Total {raffle.totalTickets} Números</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            {raffle.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa compradores, Cédulas, canal de venta (web vs talonarios en calle) y registra pagos manuales.
          </p>
        </div>

        {/* Quick count badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
            🟢 {counts.available} Disp
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-400">
            🟡 {counts.reserved} Res
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-400">
            🔴 {counts.sold} Vend
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-400">
            🌐 {counts.digital} Web
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300">
            🏷️ {counts.physical} Calle
          </span>
        </div>
      </div>

      {/* Filters, Channel & View Mode Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número (#025), cliente, teléfono o cédula..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500"
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

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Detallada</span>
            </button>
          </div>

        </div>

        {/* Secondary Filter Tabs: Status & Channel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Disponibles ({counts.available})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('RESERVED')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                statusFilter === 'RESERVED'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reservados ({counts.reserved})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SOLD')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                statusFilter === 'SOLD'
                  ? 'bg-rose-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vendidos ({counts.sold})
            </button>
          </div>

          {/* Channel Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
            <span className="text-slate-500 text-[11px] px-2">Canal:</span>
            <button
              type="button"
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                channelFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('DIGITAL')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                channelFilter === 'DIGITAL'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Digital Web</span>
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('PHYSICAL')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                channelFilter === 'PHYSICAL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Físico Calle</span>
            </button>
          </div>

        </div>
      </div>

      {/* TICKETS VIEW: GRID OR TABLE */}
      {viewMode === 'grid' ? (
        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 sm:p-6 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
            {filteredTickets.map((ticket) => {
              const isAvailable = ticket.status === 'AVAILABLE';
              const isSold = ticket.status === 'SOLD';
              const isReserved = ticket.status === 'RESERVED';

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => handleOpenInspector(ticket)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all active:scale-95 hover:scale-105 shadow-sm ${
                    isAvailable
                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-600/40 hover:border-emerald-400'
                      : isReserved
                      ? 'bg-amber-950/30 text-amber-400 border-amber-600/50 hover:border-amber-400'
                      : 'bg-rose-950/30 text-rose-400 border-rose-800/60 hover:border-rose-500'
                  }`}
                  title={`Boleto #${ticket.number} - ${ticket.status} ${ticket.customerName ? `(${ticket.customerName})` : ''}`}
                >
                  <span>#{ticket.number}</span>
                  {isReserved && <Clock className="w-3 h-3 text-amber-400 mt-0.5" />}
                  {isSold && <CheckCircle className="w-3 h-3 text-rose-400 mt-0.5" />}
                  {ticket.channel === 'PHYSICAL' && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" title="Talonario Físico" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* DETAILED TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 z-10">
                <tr>
                  <th className="px-4 py-3">Boleto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3">Cédula / ID</th>
                  <th className="px-4 py-3">Teléfono / WhatsApp</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron boletos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-black text-amber-400 text-sm">
                        #{ticket.number}
                      </td>
                      <td className="px-4 py-3">
                        {ticket.status === 'AVAILABLE' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🟢 Disponible
                          </span>
                        )}
                        {ticket.status === 'RESERVED' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            🟡 Reservado
                          </span>
                        )}
                        {ticket.status === 'SOLD' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            🔴 Pagado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ticket.channel === 'PHYSICAL' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                            <Store className="w-3 h-3" />
                            <span>Físico</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300">
                            <Globe className="w-3 h-3" />
                            <span>Digital</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ticket.customerName ? (
                          <span className="font-bold text-white">{ticket.customerName}</span>
                        ) : (
                          <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {ticket.customerCedula ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                            {ticket.customerCedula}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {ticket.customerPhone ? (
                          <div className="flex items-center gap-2">
                            <span>{ticket.customerPhone}</span>
                            <a
                              href={`https://wa.me/${ticket.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                              title="Abrir chat de WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenInspector(ticket)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-amber-500/40 transition-colors"
                        >
                          Editar / Cobrar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TICKET INSPECTOR MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Ticket Number */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-black text-2xl">
                #{selectedTicket.number}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Detalle del Boleto</span>
                <h3 className="text-xl font-black font-display text-white">
                  Boleto #{selectedTicket.number}
                </h3>
                <div className="mt-1">
                  {selectedTicket.status === 'AVAILABLE' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      🟢 Disponible
                    </span>
                  )}
                  {selectedTicket.status === 'RESERVED' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      🟡 Reservado
                    </span>
                  )}
                  {selectedTicket.status === 'SOLD' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      🔴 Vendido (Pago Confirmado)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {updateMsg && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-center text-amber-400">
                {updateMsg}
              </div>
            )}

            {/* Customer Details Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nombre del Comprador
                </label>
                <input
                  type="text"
                  value={modalCustomerName}
                  onChange={(e) => setModalCustomerName(e.target.value)}
                  placeholder="Sin asignar"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={modalCustomerPhone}
                    onChange={(e) => setModalCustomerPhone(e.target.value)}
                    placeholder="Sin teléfono"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 font-mono"
                  />
                  {modalCustomerPhone && (
                    <a
                      href={`https://wa.me/${modalCustomerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0"
                      title="Abrir chat de WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Cédula / Documento de Identidad
                </label>
                <input
                  type="text"
                  value={modalCustomerCedula}
                  onChange={(e) => setModalCustomerCedula(e.target.value)}
                  placeholder="001-0000000-0"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Canal de Venta
                </label>
                <select
                  value={modalChannel}
                  onChange={(e) => setModalChannel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="DIGITAL">Digital (Venta Web)</option>
                  <option value="PHYSICAL">Físico (Talonario en Calle)</option>
                </select>
              </div>

              {selectedTicket.reservationExpiresAt && (
                <div className="text-[11px] text-amber-400/80 pt-1">
                  ⏰ Expiración de reserva: {new Date(selectedTicket.reservationExpiresAt).toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400">
                Cambiar Estado Manualmente:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('SOLD')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirmar Pago y Marcar VENDIDO</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('RESERVED')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  <span>Marcar como RESERVADO</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('AVAILABLE')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all disabled:opacity-50"
                >
                  <span>Liberar y poner DISPONIBLE</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
