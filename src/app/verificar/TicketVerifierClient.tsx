'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Search, CheckCircle2, Clock, AlertTriangle, QrCode, Ticket, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Raffle } from '@/lib/types';

interface TicketVerifierClientProps {
  raffles: Raffle[];
}

export default function TicketVerifierClient({ raffles }: TicketVerifierClientProps) {
  const searchParams = useSearchParams();
  const initialRaffle = searchParams.get('raffle') || (raffles[0]?.slug ?? '');
  const initialNumber = searchParams.get('ticket') || searchParams.get('number') || '';

  const [selectedRaffle, setSelectedRaffle] = useState(initialRaffle);
  const [ticketNumber, setTicketNumber] = useState(initialNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRaffle || !ticketNumber.trim()) {
      setError('Por favor selecciona la rifa e ingresa el número del boleto');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationData(null);

    try {
      const res = await fetch(`/api/verify?raffle=${encodeURIComponent(selectedRaffle)}&number=${encodeURIComponent(ticketNumber.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Boleto no encontrado');
      }

      setVerificationData(data);
    } catch (err: any) {
      setError(err.message || 'Error al verificar');
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if query params are present
  useEffect(() => {
    if (initialNumber && initialRaffle) {
      handleVerify();
    }
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Back to Home */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
          Verificador Oficial de Boletos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Comprueba la autenticidad y el estado de tu boleto físico (talonario) o digital emitido por el sistema.
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Selecciona la Rifa
            </label>
            <select
              value={selectedRaffle}
              onChange={(e) => setSelectedRaffle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
            >
              {raffles.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Número del Boleto (impreso o digital)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-amber-400">
                N°
              </span>
              <input
                type="text"
                required
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="001"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-mono font-bold placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-glow flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-display text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Verificando en la base de datos...' : 'VERIFICAR AUTENTICIDAD'}</span>
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Verification Result Card */}
        {verificationData && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                Resultado de Validación:
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Auténtico
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-mono font-black text-lg flex items-center justify-center shadow-md">
                    N° {verificationData.ticket.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {verificationData.raffle.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Canal: {verificationData.ticket.channel === 'PHYSICAL' ? 'Talonario Físico Impreso' : 'Boleto Digital Web'}
                    </span>
                  </div>
                </div>

                <div>
                  {verificationData.ticket.status === 'SOLD' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✅ Pagado y Confirmado
                    </span>
                  )}
                  {verificationData.ticket.status === 'RESERVED' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      🟡 Reservado (En espera de pago)
                    </span>
                  )}
                  {verificationData.ticket.status === 'AVAILABLE' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                      Disponible sin registrar
                    </span>
                  )}
                </div>
              </div>

              {/* Registered Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block font-medium">Cliente Asignado:</span>
                  <span className="font-bold text-white">
                    {verificationData.ticket.customerName || 'Sin asignar'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Teléfono (protegido):</span>
                  <span className="font-mono text-slate-300">
                    {verificationData.ticket.customerPhone || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Cédula (protegida):</span>
                  <span className="font-mono text-slate-300">
                    {verificationData.ticket.customerCedula || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/80 flex items-center justify-between">
                <span>Fecha del Sorteo Oficial: {new Date(verificationData.raffle.drawDate).toLocaleDateString()} ({verificationData.raffle.drawTime || '08:00 P.M.'})</span>
                <span>¡Gracias por participar! ❤️</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
