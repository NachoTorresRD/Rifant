'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Gift, 
  Settings2, Phone, Eye, Rocket, Calendar, Ticket, DollarSign, Image as ImageIcon
} from 'lucide-react';

export default function NewRaffleWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Prize
    title: '',
    category: 'Tecnología',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1200&auto=format&fit=crop',
    description: '',

    // Step 2: Config
    pricePerTicket: 200,
    currency: 'RD$',
    totalTickets: 100,
    drawDate: '',

    // Step 3: Contact
    organizerName: 'Sorteos VIP',
    organizerPhone: '+18095550000',
    instagramUrl: '',
    facebookUrl: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setErrorMessage('Ingresa el nombre o título del premio');
        return;
      }
      if (!formData.imageUrl.trim()) {
        setErrorMessage('Ingresa la URL de la imagen del premio');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.pricePerTicket || formData.pricePerTicket <= 0) {
        setErrorMessage('El precio por número debe ser mayor a 0');
        return;
      }
      if (!formData.drawDate) {
        setErrorMessage('Selecciona la fecha y hora del sorteo');
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.organizerName.trim()) {
        setErrorMessage('Ingresa el nombre del organizador');
        return;
      }
      if (!formData.organizerPhone.trim()) {
        setErrorMessage('Ingresa el número de WhatsApp para recibir pedidos');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit and Publish
  const handlePublish = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // Auto-generate slug from title
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch('/api/admin/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
          digitsCount: formData.totalTickets <= 100 ? 2 : 3,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al publicar la rifa');
      }

      router.push(`/admin`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear la rifa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel de Administración</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
          Crear Nueva Rifa en 4 Pasos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configura los detalles de tu premio, cantidad de números y contacto para WhatsApp.
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 border-y border-slate-800/80 py-4">
        {[
          { step: 1, label: 'Premio', icon: Gift },
          { step: 2, label: 'Configuración', icon: Settings2 },
          { step: 3, label: 'Contacto', icon: Phone },
          { step: 4, label: 'Vista Previa', icon: Eye },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <div
              key={s.step}
              className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400'
                  : isDone
                  ? 'text-emerald-400 opacity-90'
                  : 'text-slate-500 opacity-50'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* ================= STEP 1: PREMIO ================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-pop-in">
            <h2 className="text-lg font-black font-display text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>PASO 1: Información del Premio</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre o Título de la Rifa <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ej: 🎁 iPhone 17 Pro Max 256GB Titanium"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <option value="Tecnología">Tecnología / Smartphones</option>
                  <option value="Gaming">Gaming / Consolas</option>
                  <option value="Vehículos">Vehículos / Motos</option>
                  <option value="Dinero">Dinero en Efectivo</option>
                  <option value="Electrodomésticos">Electrodomésticos</option>
                  <option value="Viajes">Viajes & Experiencias</option>
                  <option value="Otros">Otros Premios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL de la Imagen del Premio <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => updateField('imageUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Quick image preview */}
            {formData.imageUrl && (
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => {}}
                  />
                </div>
                <div className="text-xs text-slate-400">
                  <span className="text-white font-semibold block">Vista previa de imagen</span>
                  Asegúrate de que la imagen sea clara y en alta resolución para atraer más personas.
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descripción Detallada
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe qué incluye el premio, garantía, condición (nuevo/sellado), accesorios, etc."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2: CONFIGURACIÓN ================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-pop-in">
            <h2 className="text-lg font-black font-display text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-amber-400" />
              <span>PASO 2: Configuración de Boletos y Fecha</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Precio por Número <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-400">
                    RD$
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={formData.pricePerTicket}
                    onChange={(e) => updateField('pricePerTicket', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cantidad Total de Números
                </label>
                <select
                  value={formData.totalTickets}
                  onChange={(e) => updateField('totalTickets', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <option value={50}>50 números (del 00 al 49)</option>
                  <option value={100}>100 números (del 00 al 99)</option>
                  <option value={200}>200 números (del 000 al 199)</option>
                  <option value={500}>500 números (del 000 al 499)</option>
                  <option value={1000}>1,000 números (del 000 al 999)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fecha y Hora del Sorteo <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="datetime-local"
                  value={formData.drawDate}
                  onChange={(e) => updateField('drawDate', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            {/* Projection Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Recaudación potencial estimada:</span>
              <span className="text-lg font-black font-display text-emerald-400">
                RD${(formData.pricePerTicket * formData.totalTickets).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONTACTO ================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-pop-in">
            <h2 className="text-lg font-black font-display text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span>PASO 3: Información de Contacto y Redes</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre del Organizador o Empresa <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={(e) => updateField('organizerName', e.target.value)}
                placeholder="Ej: Sorteos VIP Dominicana"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Número de WhatsApp (con código de país) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.organizerPhone}
                  onChange={(e) => updateField('organizerPhone', e.target.value)}
                  placeholder="Ej: +18095551234"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                A este WhatsApp los participantes enviarán sus números reservados para confirmar el pago.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enlace a Instagram (opcional)
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => updateField('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/tu_cuenta"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enlace a Facebook (opcional)
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => updateField('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/tu_pagina"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: VISTA PREVIA ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-pop-in">
            <div>
              <h2 className="text-lg font-black font-display text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <span>PASO 4: Vista Previa Pública</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Así es exactamente como verán tu rifa las personas que lleguen desde redes sociales.
              </p>
            </div>

            {/* PREVIEW CARD */}
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl">
              
              <div className="relative aspect-[16/9] w-full bg-slate-900">
                <Image
                  src={formData.imageUrl}
                  alt={formData.title || 'Premio'}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30">
                    {formData.category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                  {formData.title || 'Título de ejemplo'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {formData.description || 'Sin descripción'}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Precio</span>
                    <span className="text-base font-black text-amber-400 font-display">
                      RD${formData.pricePerTicket}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Números</span>
                    <span className="text-base font-black text-white font-mono">
                      {formData.totalTickets <= 100 ? '00-99' : '000-999'}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">Organizador</span>
                    <span className="text-xs font-bold text-slate-200 truncate block">
                      {formData.organizerName}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-amber-400 font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  📅 Fecha del sorteo: {formData.drawDate ? new Date(formData.drawDate).toLocaleString() : 'Pendiente'}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* BOTTOM STEP NAVIGATION BUTTONS */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-glow flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
            >
              <span>Siguiente Paso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="btn-glow flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 hover:from-emerald-400 hover:to-teal-200 text-slate-950 text-sm font-black font-display tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              <Rocket className="w-5 h-5 fill-slate-950" />
              <span>{loading ? 'Generando boletos...' : '🚀 PUBLICAR RIFA'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
