'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Sparkles, Trophy, Menu, X, QrCode, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo - Focused on Trust & Official Draws */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Ticket className="w-5 h-5 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-white bg-clip-text text-transparent">
              RifaNT
            </span>
            <span className="text-[10px] text-amber-400/90 tracking-wider font-bold uppercase -mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Sorteos Oficiales
            </span>
          </div>
        </Link>

        {/* Participant-Focused Desktop Navigation (NO Admin Distractions) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#rifas-activas"
            className="text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Rifas Activas</span>
          </Link>

          <Link
            href="/verificar"
            className="text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Verificar Boleto</span>
          </Link>

          <Link
            href="/rifa/50000-efectivo/ganador"
            className="text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Ganadores Oficiales</span>
          </Link>
        </nav>

        {/* Dominant Primary Participant CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/18295551234?text=Hola%20tengo%20una%20consulta%20sobre%20las%20rifas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-300 hover:text-emerald-400 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Soporte WhatsApp</span>
          </a>

          <Link
            href="/#rifas-activas"
            className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-wide"
          >
            <Ticket className="w-4 h-4 fill-slate-950" />
            <span>Participar Ahora</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu dropdown (100% Buyer Focused) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-3 bg-slate-950 border-b border-slate-800 animate-pop-in">
          <Link
            href="/#rifas-activas"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-slate-200 font-semibold hover:bg-slate-900"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ver Rifas Activas</span>
          </Link>

          <Link
            href="/verificar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-slate-200 font-semibold hover:bg-slate-900"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Verificar Boleto (QR / Número)</span>
          </Link>

          <Link
            href="/rifa/50000-efectivo/ganador"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-slate-200 font-semibold hover:bg-slate-900"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Ganadores Anteriores</span>
          </Link>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/#rifas-activas"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-xl font-black bg-amber-500 text-slate-950 text-sm shadow-md"
            >
              🎟️ ELEGIR MIS NÚMEROS
            </Link>

            <a
              href="https://wa.me/18295551234"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-emerald-400 text-xs bg-emerald-950/30 border border-emerald-800/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Soporte por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
