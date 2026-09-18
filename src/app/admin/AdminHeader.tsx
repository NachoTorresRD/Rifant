'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogOut, ArrowLeft, UserCheck } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    // Read the email from cookie if available
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'rifant_admin_email' && val) {
        setAdminEmail(decodeURIComponent(val));
        break;
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Administración Activa
          </span>
          {adminEmail && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>{adminEmail}</span>
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
          Panel de Control de Rifas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Supervisa el estado de tus ventas, gestiona boletos y ejecuta sorteos oficiales.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ir a la Web Pública</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
