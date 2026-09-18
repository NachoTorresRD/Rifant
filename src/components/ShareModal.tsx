'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, Facebook, Instagram } from 'lucide-react';
import { Raffle } from '@/lib/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: Raffle;
}

export default function ShareModal({ isOpen, onClose, raffle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://rifant.com/rifa/${raffle.slug}`;
  const shareText = `¡Participa en la rifa de ${raffle.title}! Cada número a solo ${raffle.currency}${raffle.pricePerTicket}. Entra aquí: ${currentUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black font-display text-white">
              Compartir esta Rifa
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Difunde el enlace en tus redes para que tus amigos y seguidores elijan sus números.
            </p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 active:scale-95 transition-all"
            >
              <Send className="w-6 h-6" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={shareFacebook}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-700/50 text-blue-400 active:scale-95 transition-all"
            >
              <Facebook className="w-6 h-6" />
              <span className="text-xs font-bold">Facebook</span>
            </button>

            <button
              type="button"
              onClick={copyToClipboard}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-700/50 text-pink-400 active:scale-95 transition-all"
            >
              <Instagram className="w-6 h-6" />
              <span className="text-xs font-bold">Instagram</span>
            </button>
          </div>

          {/* Direct Link Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">
              O copia el enlace directo:
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 pl-3">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none truncate"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
