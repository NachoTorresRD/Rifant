'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Phone, AlertCircle, Sparkles, Send, CreditCard, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Raffle } from '@/lib/types';
import { calculateRafflePrice } from '@/lib/pricing';
import DigitalTicketCard from './DigitalTicketCard';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: Raffle;
  selectedNumbers: string[];
  onReservationSuccess: () => void;
}

export default function ReservationModal({
  isOpen,
  onClose,
  raffle,
  selectedNumbers,
  onReservationSuccess,
}: ReservationModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formLoadedAt, setFormLoadedAt] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reservationResult, setReservationResult] = useState<{
    whatsappUrl: string;
    expiresAt: string;
    orderId: string;
    discount: number;
  } | null>(null);

  // Record modal open time to detect superhuman bot submit velocity (<1.2s)
  useEffect(() => {
    if (isOpen) {
      setFormLoadedAt(Date.now());
      setHoneypot('');
    }
  }, [isOpen]);

  // Countdown timer for 10 minutes lock
  const [timeLeft, setTimeLeft] = useState<number>(600);

  useEffect(() => {
    if (!reservationResult?.expiresAt) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(reservationResult.expiresAt).getTime() - Date.now();
      const seconds = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationResult]);

  if (!isOpen) return null;

  const { total: totalAmount, discount } = calculateRafflePrice(raffle, selectedNumbers.length);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Por favor ingresa tu número de WhatsApp para confirmar tu boleto');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/raffles/${raffle.slug}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          customerName: name,
          customerPhone: phone,
          customerCedula: cedula,
          customerEmail: email,
          company_code: honeypot, // Hidden bot trap
          formLoadedAt, // Timing verification
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar la reserva');
      }

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setReservationResult({
        whatsappUrl: data.whatsappUrl,
        expiresAt: data.expiresAt,
        orderId: data.order.id,
        discount: data.discount || 0,
      });

      onReservationSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {!reservationResult ? (
          /* STEP 1: FORM WITH CÉDULA & COMBO DISCOUNTS */
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Reserva de Boletos Físicos y Digitales
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Completa tus datos para tu Boleto Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Generaremos tu boleto oficial personalizado con tu número, talón y código de autenticidad.
              </p>
            </div>

            {/* Selection Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Tus números seleccionados:</span>
                {raffle.promoText && selectedNumbers.length >= 2 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/40 border border-red-800/50 px-2 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />
                    {raffle.promoText}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs"
                  >
                    #{num}
                  </span>
                ))}
              </div>
              
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-sm">
                <div className="space-y-0.5">
                  <span className="text-slate-300 font-medium block text-xs sm:text-sm">
                    {selectedNumbers.length} boletos {discount > 0 ? '(con oferta combo)' : ''}
                  </span>
                  {discount > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold block">
                      Ahorro aplicado: -{raffle.currency}{discount}
                    </span>
                  )}
                </div>
                <span className="text-lg sm:text-xl font-black font-display text-amber-400">
                  Total: {raffle.currency}{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleReserve} className="space-y-4">
              
              {/* Anti-bot Honeypot trap: invisible to humans, auto-filled by spam bots */}
              <div 
                className="opacity-0 absolute -z-50 select-none pointer-events-none h-0 w-0 overflow-hidden" 
                aria-hidden="true" 
                tabIndex={-1}
              >
                <label htmlFor="company_code">Dejar vacío este campo de seguridad</label>
                <input
                  id="company_code"
                  type="text"
                  name="company_code"
                  autoComplete="off"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre del cliente <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teléfono / WhatsApp <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="8090000000"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cédula / Documento <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="001-0000000-0"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Aparecerá en el talón de tu boleto</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo electrónico <span className="text-slate-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tuemail@ejemplo.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-glow flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black font-display text-base tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Generando boleto digital...</span>
                ) : (
                  <span>🔥 RESERVAR Y EMITIR BOLETO</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: PRESENTATION OF DIGITAL TICKET + WHATSAPP CONFIRMATION */
          <div className="space-y-6 text-center py-1">
            
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black font-display text-white">
                ¡Tu Boleto Digital está Listo!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Hemos bloqueado tus boletos por 10 minutos. Envía tu comprobante o confirma por WhatsApp para activar tu boleto en el sorteo oficial.
              </p>
            </div>

            {/* Countdown timer badge */}
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-3 flex items-center justify-center gap-3 text-amber-300 max-w-sm mx-auto">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <div className="text-xs text-left">
                <span className="font-semibold block">Tiempo para confirmar pago:</span>
                <span className="font-mono text-base font-black text-amber-400">
                  {formatCountdown(timeLeft)}
                </span>
              </div>
            </div>

            {/* THE ACTUAL DIGITAL VIP TICKET CARD PREVIEW */}
            <div className="pt-2 text-left">
              <span className="text-xs font-bold text-amber-400 block mb-2 text-center uppercase tracking-wider">
                ✨ Tu Boleto Digital Oficial Emitido
              </span>
              <DigitalTicketCard
                raffle={raffle}
                ticketNumber={selectedNumbers[0] || '001'}
                customerName={name}
                customerPhone={phone}
                customerCedula={cedula}
              />
            </div>

            {/* WHATSAPP CTA BUTTON */}
            <div className="space-y-3 pt-2">
              <a
                href={reservationResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-glow-emerald flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-display text-base tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5 fill-slate-950" />
                <span>📲 ENVIAR POR WHATSAPP AL ORGANIZADOR</span>
              </a>

              <p className="text-[11px] text-slate-500">
                Al enviar el mensaje por WhatsApp, el organizador verificará tu pago y marcará tu boleto como pagado.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white font-medium hover:underline"
            >
              Cerrar ventana
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
