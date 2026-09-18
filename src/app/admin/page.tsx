import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  Ticket, Users, DollarSign, Flame, Clock, 
  CheckCircle, PlusCircle, ExternalLink, Settings, 
  Trophy, LogOut, Eye, AlertTriangle, Printer,
  Globe, Store
} from 'lucide-react';
import { verifyAdminAuth } from '@/lib/auth';
import { getAllRaffles, getRaffleStats } from '@/lib/db';
import AdminHeader from './AdminHeader';
import RaffleStatusToggle from './RaffleStatusToggle';
import DeleteRaffleButton from './DeleteRaffleButton';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const rawRaffles = await getAllRaffles();
  const rafflesWithStats = await Promise.all(
    rawRaffles.map(async (r) => {
      const stats = await getRaffleStats(r.id);
      return { ...r, stats };
    })
  );

  // Global aggregate stats
  const globalStats = rafflesWithStats.reduce(
    (acc, cur) => {
      acc.totalTickets += cur.stats.totalTickets;
      acc.availableTickets += cur.stats.availableTickets;
      acc.reservedTickets += cur.stats.reservedTickets;
      acc.soldTickets += cur.stats.soldTickets;
      acc.soldDigital += cur.stats.soldDigital || 0;
      acc.soldPhysical += cur.stats.soldPhysical || 0;
      acc.totalRevenue += cur.stats.totalRevenue;
      acc.participants += cur.stats.uniqueParticipants;
      return acc;
    },
    {
      totalTickets: 0,
      availableTickets: 0,
      reservedTickets: 0,
      soldTickets: 0,
      soldDigital: 0,
      soldPhysical: 0,
      totalRevenue: 0,
      participants: 0,
    }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header with actions */}
      <AdminHeader />

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Dinero */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recaudación Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-emerald-400">
            RD${globalStats.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Boletos cobrados</span>
        </div>

        {/* Vendidos Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Vendidos</span>
            <CheckCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-white">
            {globalStats.soldTickets}
          </div>
          <span className="text-[10px] text-slate-500">
            {globalStats.totalTickets > 0 ? Math.round((globalStats.soldTickets / globalStats.totalTickets) * 100) : 0}% colocado
          </span>
        </div>

        {/* Ventas Digitales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Canal Digital (Web)</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-blue-400">
            {globalStats.soldDigital}
          </div>
          <span className="text-[10px] text-slate-500">Compras vía web</span>
        </div>

        {/* Ventas Físicas (Talonarios) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Canal Físico</span>
            <Store className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-amber-400">
            {globalStats.soldPhysical}
          </div>
          <span className="text-[10px] text-slate-500">Talonarios impresos</span>
        </div>

        {/* Reservados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reservados</span>
            <Clock className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-amber-300">
            {globalStats.reservedTickets}
          </div>
          <span className="text-[10px] text-slate-500">Esperando pago</span>
        </div>

        {/* Disponibles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Disponibles</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-emerald-300">
            {globalStats.availableTickets}
          </div>
          <span className="text-[10px] text-slate-500">Listos para compra</span>
        </div>

      </div>

      {/* RAFFLES MANAGEMENT TABLE */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black font-display text-white">
              Tus Rifas y Sorteos Activos
            </h2>
            <p className="text-xs text-slate-400">
              Gestiona números, imprime talonarios físicos completos en 2×4 o ejecuta el sorteo oficial certificado.
            </p>
          </div>

          <Link
            href="/admin/rifas/nueva"
            className="btn-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Nueva Rifa</span>
          </Link>
        </div>

        {/* List of cards */}
        <div className="grid grid-cols-1 gap-4">
          {rafflesWithStats.map((raffle) => {
            const isFinished = raffle.status === 'FINISHED';

            return (
              <div
                key={raffle.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                {/* Left details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 border border-amber-500/20">
                      {raffle.category}
                    </span>
                    <RaffleStatusToggle raffleId={raffle.id} currentStatus={raffle.status} />
                    <span className="text-xs text-slate-500 font-mono">
                      /{raffle.slug}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white">
                    {raffle.title}
                  </h3>

                  {/* Progress & Numbers */}
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{raffle.stats.soldTickets} / {raffle.stats.totalTickets} vendidos ({raffle.stats.percentageSold}%)</span>
                      <span className="text-emerald-400 font-semibold">{raffle.stats.availableTickets} disponibles</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${raffle.stats.percentageSold}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics & Channel Breakdown */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>Precio: <strong className="text-white">{raffle.currency}{raffle.pricePerTicket}</strong></span>
                    <span>Recaudado: <strong className="text-emerald-400">RD${raffle.stats.totalRevenue.toLocaleString()}</strong></span>
                    <span>Sorteo: <strong className="text-white">{new Date(raffle.drawDate).toLocaleDateString()}</strong></span>
                    
                    {/* Canal breakdown badges */}
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-950/40 border border-blue-800/40 text-blue-400">
                        🌐 {raffle.stats.soldDigital || 0} Web
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/40 border border-amber-800/40 text-amber-300">
                        🏷️ {raffle.stats.soldPhysical || 0} Talonario
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0 md:min-w-[210px]">
                  
                  {/* PRINT TICKETS BUTTON - PROMINENT FOR PHYSICAL FIELD */}
                  <Link
                    href={`/admin/rifas/${raffle.id}/imprimir`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/10 active:scale-95 transition-all"
                    title="Imprimir todos los boletos en hojas de 8 para la calle"
                  >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span>🖨️ Imprimir Boletos (Todos)</span>
                  </Link>

                  {/* EDIT RAFFLE BUTTON */}
                  <Link
                    href={`/admin/rifas/${raffle.id}/editar`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 hover:border-amber-500/40 transition-all"
                    title="Editar datos, precio y boletos de esta rifa"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>✏️ Editar Rifa</span>
                  </Link>

                  {/* Manage tickets button */}
                  <Link
                    href={`/admin/rifas/${raffle.id}/boletos`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    <span>Administrar Números</span>
                  </Link>

                  {/* Sorteo / Winner button */}
                  {isFinished ? (
                    <Link
                      href={`/rifa/${raffle.slug}/ganador`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Ganador (#{raffle.winnerTicket})</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/rifas/${raffle.id}/sorteo`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white text-xs font-bold border border-amber-500/30 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ejecutar Sorteo</span>
                    </Link>
                  )}

                  {/* Bottom preview & delete actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/rifa/${raffle.slug}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Web</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </Link>
                    <DeleteRaffleButton raffleId={raffle.id} raffleTitle={raffle.title} />
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

