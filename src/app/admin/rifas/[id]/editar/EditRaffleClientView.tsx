'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Save, Sparkles, Ticket, DollarSign, Calendar, 
  Phone, Globe, Image as ImageIcon, CheckCircle, AlertCircle, Eye, ExternalLink
} from 'lucide-react';
import { Raffle, RaffleStats } from '@/lib/types';

interface EditRaffleClientViewProps {
  initialRaffle: Raffle;
  stats: RaffleStats;
}

const TICKET_PRESETS = [50, 100, 200, 500, 1000];
const CATEGORIES = ['Tecnología', 'Celulares', 'Vehículos', 'Dinero', 'Gaming', 'Hogar', 'Moda', 'Otro'];

export default function EditRaffleClientView({
  initialRaffle,
  stats,
}: EditRaffleClientViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [title, setTitle] = useState(initialRaffle.title);
  const [slug, setSlug] = useState(initialRaffle.slug);
  const [description, setDescription] = useState(initialRaffle.description);
  const [category, setCategory] = useState(initialRaffle.category);
  const [imageUrl, setImageUrl] = useState(initialRaffle.imageUrl);
  const [pricePerTicket, setPricePerTicket] = useState(initialRaffle.pricePerTicket);
  const [currency, setCurrency] = useState(initialRaffle.currency || 'RD$');
  const [comboQty, setComboQty] = useState(initialRaffle.comboQty || 2);
  const [comboPrice, setComboPrice] = useState(initialRaffle.comboPrice || 0);
  const [promoText, setPromoText] = useState(initialRaffle.promoText || '');
  const [totalTickets, setTotalTickets] = useState(initialRaffle.totalTickets);
  const [drawDate, setDrawDate] = useState(
    initialRaffle.drawDate ? new Date(initialRaffle.drawDate).toISOString().split('T')[0] : ''
  );
  const [drawTime, setDrawTime] = useState(initialRaffle.drawTime || '08:00 P.M.');
  const [status, setStatus] = useState(initialRaffle.status);
  const [organizerName, setOrganizerName] = useState(initialRaffle.organizerName);
  const [organizerPhone, setOrganizerPhone] = useState(initialRaffle.organizerPhone);
  const [instagramUrl, setInstagramUrl] = useState(initialRaffle.instagramUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(initialRaffle.facebookUrl || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload: Partial<Raffle> = {
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        category,
        imageUrl: imageUrl.trim(),
        pricePerTicket: Number(pricePerTicket),
        currency,
        comboQty: Number(comboQty) || undefined,
        comboPrice: Number(comboPrice) || undefined,
        promoText: promoText.trim() || undefined,
        totalTickets: Number(totalTickets),
        drawDate: drawDate ? new Date(drawDate).toISOString() : initialRaffle.drawDate,
        drawTime: drawTime.trim(),
        status,
        organizerName: organizerName.trim(),
        organizerPhone: organizerPhone.trim(),
        instagramUrl: instagramUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
      };

      const res = await fetch(`/api/admin/raffles/${initialRaffle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar los cambios');
      }

      setSuccessMessage('¡Rifa actualizada con éxito! Redirigiendo al panel...');
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top breadcrumb & navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              Editar Rifa: {initialRaffle.title}
            </h1>
            <p className="text-xs text-slate-400">
              Modifica boletos, precios, imágenes, sorteo y detalles de administración.
            </p>
          </div>
        </div>

        <Link
          href={`/rifa/${initialRaffle.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Página Pública</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Stats Pill */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
          <span className="text-slate-400">Boletos Actuales</span>
          <p className="text-base font-bold text-white">{stats.totalTickets}</p>
        </div>
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
          <span className="text-slate-400">Vendidos</span>
          <p className="text-base font-bold text-rose-400">{stats.soldTickets}</p>
        </div>
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
          <span className="text-slate-400">Disponibles</span>
          <p className="text-base font-bold text-emerald-400">{stats.availableTickets}</p>
        </div>
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
          <span className="text-slate-400">Recaudación</span>
          <p className="text-base font-bold text-amber-400">RD${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: DETALLES DEL PREMIO */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>1. Información del Premio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título del Sorteo / Premio *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. RIFA iPhone 17 Pro Max 256GB Oficial"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slug / URL pública *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej. iphone-17-pro-max"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                La URL será: <span className="text-amber-400 font-mono">/rifa/{slug}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoría del Premio *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL de la Imagen del Premio (Directa o Unsplash) *
              </label>
              <div className="flex gap-4 items-start">
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-mono text-xs"
                />
                {imageUrl && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <Image
                      src={imageUrl}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descripción del Premio y Condiciones
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalla qué incluye el premio, garantía, entrega personal o transferencia..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BOLETOS Y COMBOS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Ticket className="w-4 h-4" />
            <span>2. Cantidad de Boletos y Precios</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cantidad Total de Boletos
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {TICKET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTotalTickets(preset)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      totalTickets === preset
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset} Boletos {preset <= 100 ? `(del 00 al ${preset - 1})` : `(3 dígitos)`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                required
                min={10}
                max={10000}
                value={totalTickets}
                onChange={(e) => setTotalTickets(Number(e.target.value))}
                className="w-full sm:w-48 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 Si eliges <strong>100 boletos</strong>, la numeración va del <strong>00 al 99</strong> con 2 dígitos, ideal para sorteos rápidos y populares.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Precio Individual por Boleto *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pricePerTicket}
                    onChange={(e) => setPricePerTicket(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <option value="RD$">RD$ (Pesos Dominicanos)</option>
                  <option value="$USD">$USD (Dólares)</option>
                </select>
              </div>
            </div>

            {/* COMBO PROMO */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Descuento por Combo Promocional (Opcional)
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Cantidad del Combo
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={comboQty}
                    onChange={(e) => setComboQty(Number(e.target.value))}
                    placeholder="2"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Precio Total del Combo
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={comboPrice}
                    onChange={(e) => setComboPrice(Number(e.target.value))}
                    placeholder="500"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Texto de la Oferta
                  </label>
                  <input
                    type="text"
                    value={promoText}
                    onChange={(e) => setPromoText(e.target.value)}
                    placeholder="2 BOLETOS POR RD$500"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: FECHA, HORA Y ESTADO */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>3. Fecha, Hora y Estado del Sorteo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fecha del Sorteo *
              </label>
              <input
                type="date"
                required
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hora del Sorteo *
              </label>
              <input
                type="text"
                required
                value={drawTime}
                onChange={(e) => setDrawTime(e.target.value)}
                placeholder="08:00 P.M."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estado Actual de la Rifa
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white font-bold"
              >
                <option value="ACTIVE">🟢 Activa (Permite Reservas)</option>
                <option value="PAUSED">🟡 Pausada (Sólo Lectura)</option>
                <option value="FINISHED">🏆 Finalizada (Con Ganador)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: ORGANIZADOR Y REDES */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Phone className="w-4 h-4" />
            <span>4. Organizador y Canales de Contacto</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre de la Empresa o Marca *
              </label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Ej. Sorteos VIP RD"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                WhatsApp Oficial del Organizador *
              </label>
              <input
                type="tel"
                required
                value={organizerPhone}
                onChange={(e) => setOrganizerPhone(e.target.value)}
                placeholder="+18295551234"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Instagram Oficial (Opcional)
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/tu_cuenta"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                TikTok / Facebook (Opcional)
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://tiktok.com/@tu_cuenta"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs text-center transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto btn-glow flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-display text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? <span>Guardando Cambios...</span> : <span>Guardar Cambios de la Rifa</span>}
          </button>
        </div>

      </form>

    </div>
  );
}
