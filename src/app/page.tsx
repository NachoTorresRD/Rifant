import React from 'react';
import Link from 'next/link';
import { Sparkles, Ticket, ShieldCheck, Zap, Trophy, ArrowRight, CheckCircle, Smartphone, QrCode } from 'lucide-react';
import { getAllRaffles, getRaffleStats } from '@/lib/db';
import RaffleCard from '@/components/RaffleCard';

export const revalidate = 0;

export default async function HomePage() {
  const rawRaffles = await getAllRaffles();

  const raffles = await Promise.all(
    rawRaffles.map(async (r) => {
      const stats = await getRaffleStats(r.id);
      return { ...r, stats };
    })
  );

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION - 100% Focused on Participant Value & Conversion */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-24 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-yellow-500/10 to-blue-600/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Official Seal Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Sorteos Oficiales con Boletos Físicos y Digitales VIP</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Gana premios increíbles con tus{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              números de la suerte
            </span>
          </h1>

          {/* Subtitle answering: What is this? Outcome? Action? */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Participa en rifas transparentes y modernas. 
            Elige tus boletos digitales o talonarios físicos, recibe confirmación inmediata por WhatsApp y verifica tu número en tiempo real.
          </p>

          {/* Single Dominant Primary Call to Action (CRO Rule) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <a
              href="#rifas-activas"
              className="w-full sm:w-auto btn-glow flex items-center justify-center gap-3 px-10 py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black font-display text-base tracking-wide shadow-2xl shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Ticket className="w-5 h-5 fill-slate-950" />
              <span>🎟️ ELEGIR MIS NÚMEROS AHORA</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </a>

            <Link
              href="/verificar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm border border-slate-800 transition-all"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Verificar mi Boleto</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Reserva segura por 10 min</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sorteo oficial verificable</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Confirmación vía WhatsApp</span>
            </div>
          </div>

        </div>
      </section>

      {/* ACTIVE RAFFLES SECTION */}
      <section id="rifas-activas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>Sorteos Disponibles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Premios Activos en Juego
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
            Toca cualquiera de los premios para abrir la cuadrícula de boletos y seleccionar tus números de la suerte.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-12 relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
              Transparencia y Facilidad
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              ¿Cómo participar en 3 simples pasos?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Step 1 */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black font-display text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Elige tus Números
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Selecciona tus números favoritos manualmente en la cuadrícula o usa los botones de selección aleatoria (1, 5 o 10 números). ¡Aprovecha los descuentos de combo!
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black font-display text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Reserva y Confirma
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ingresa tu nombre, teléfono y cédula. Tus números quedarán reservados por 10 minutos y podrás enviar tu confirmación por WhatsApp con 1 solo clic.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center font-black font-display text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                ¡Gana tu Premio!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                El sorteo se efectúa de manera 100% verificable. Podrás ver los resultados en vivo, consultar tu boleto digital y celebrar al ganador oficial.
              </p>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-center">
            <a
              href="#rifas-activas"
              className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-md"
            >
              <span>Ver Premios Disponibles Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
