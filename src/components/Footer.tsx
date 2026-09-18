import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, Phone, Mail, QrCode, Sparkles, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 text-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Guarantee */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
                <Ticket className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="font-display font-black text-xl text-white">
                RifaNT
              </span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs sm:text-sm leading-relaxed">
              Plataforma oficial de sorteos y rifas transparentes. 
              Garantía de selección de ganador verificable, boletos físicos con talón y e-tickets digitales oficiales con confirmación inmediata por WhatsApp.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              Sorteos auditados y respaldados con talón oficial
            </div>
          </div>

          {/* Quick Participant Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Para Participantes</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#rifas-activas" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sorteos Activos</span>
                </Link>
              </li>
              <li>
                <Link href="/verificar" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verificar mi Boleto (QR / Código)</span>
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-amber-400 transition-colors">
                  Cómo Participar en 3 Pasos
                </Link>
              </li>
              <li>
                <Link href="/rifa/50000-efectivo/ganador" className="hover:text-amber-400 transition-colors">
                  Historial de Ganadores
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Atención al Cliente</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp: +1 (829) 555-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>soporte@rifant.com</span>
              </li>
            </ul>
            <div className="pt-2 text-xs text-slate-500">
              Horario de sorteos: Transmisiones en vivo según la fecha oficial programada.
            </div>
          </div>

        </div>

        {/* Bottom Bar with discrete organizer access */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RifaNT. Todos los derechos reservados.</p>
          
          <div className="flex items-center gap-4">
            <span>República Dominicana</span>
            <span>•</span>
            <Link
              href="/admin"
              className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
              title="Acceso exclusivo para organizadores del sorteo"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Organizador</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
