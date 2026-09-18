'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Flame, X, Music, MessageCircle, Instagram } from 'lucide-react';

interface ActivityItem {
  id: string;
  source: string;
  type: 'tiktok' | 'zap' | 'flame' | 'whatsapp' | 'instagram';
  message: string;
  timeAgo: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    source: 'Usuario de TikTok',
    type: 'tiktok',
    message: 'Apartó el boleto #042 para iPhone 17 Pro Max',
    timeAgo: 'hace 1m',
  },
  {
    id: 'act-2',
    source: 'Usuario de WhatsApp',
    type: 'whatsapp',
    message: 'Compró 2 boletos (#088, #089) para PlayStation 5 Pro',
    timeAgo: 'hace 45s',
  },
  {
    id: 'act-3',
    source: 'Carlos M. (Santo Domingo)',
    type: 'flame',
    message: 'Apartó el boleto #712 para iPhone 17 Pro Max',
    timeAgo: 'hace 2m',
  },
  {
    id: 'act-4',
    source: 'Usuario de TikTok',
    type: 'tiktok',
    message: 'Apartó el combo (#005, #006) para PlayStation 5 Pro',
    timeAgo: 'hace 30s',
  },
  {
    id: 'act-5',
    source: 'Alguien de Santiago',
    type: 'zap',
    message: 'Compró el boleto #324 para iPhone 17 Pro Max',
    timeAgo: 'hace 1m',
  },
  {
    id: 'act-6',
    source: 'Usuario de Instagram',
    type: 'instagram',
    message: 'Apartó el boleto #105 para PlayStation 5 Pro',
    timeAgo: 'hace 15s',
  },
  {
    id: 'act-7',
    source: 'María F. (La Vega)',
    type: 'flame',
    message: 'Apartó el boleto #019 para iPhone 17 Pro Max',
    timeAgo: 'hace 3m',
  },
];

export default function LiveActivityToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Initial delay before first toast
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Toast stays visible for 5s
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // Wait 3.5s before showing next toast
      const nextTimer = setTimeout(() => {
        if (!isDismissed) {
          setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
          setIsVisible(true);
        }
      }, 3500);

      return () => clearTimeout(nextTimer);
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed]);

  if (isDismissed) return null;

  const current = ACTIVITIES[currentIndex];

  const renderIcon = () => {
    switch (current.type) {
      case 'tiktok':
        return (
          <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10 shrink-0">
            <Music className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
        );
      case 'whatsapp':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 shrink-0">
            <MessageCircle className="w-4 h-4 text-emerald-300 animate-pulse" />
          </div>
        );
      case 'flame':
        return (
          <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-md shadow-rose-500/10 shrink-0">
            <Flame className="w-4 h-4 text-rose-300 animate-bounce" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-10 h-10 rounded-full bg-pink-950/80 border border-pink-400/40 flex items-center justify-center text-pink-400 shadow-md shadow-pink-500/10 shrink-0">
            <Instagram className="w-4 h-4 text-pink-300" />
          </div>
        );
      case 'zap':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
          </div>
        );
    }
  };

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      aria-label="Actividad reciente de compras y reservas"
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 max-w-[340px] sm:max-w-sm w-full transition-all duration-500 ease-out print:hidden ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl bg-[#09101d]/95 border border-cyan-500/30 p-3 sm:p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl flex items-center gap-3 group">
        
        {/* Glowing Indicator Icon */}
        {renderIcon()}

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white leading-tight">
            {current.type === 'tiktok' && <span className="text-cyan-400 text-sm">🎵</span>}
            {current.type === 'whatsapp' && <span className="text-emerald-400 text-sm">💬</span>}
            {current.type === 'flame' && <span className="text-rose-400 text-sm">🔥</span>}
            {current.type === 'zap' && <span className="text-amber-400 text-sm">⚡</span>}
            {current.type === 'instagram' && <span className="text-pink-400 text-sm">📸</span>}
            
            <span className="truncate">{current.source}</span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
            {current.message}{' '}
            <span className="text-slate-400 font-normal">({current.timeAgo})</span>
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-200 transition-colors"
          title="Ocultar notificaciones"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </aside>
  );
}
