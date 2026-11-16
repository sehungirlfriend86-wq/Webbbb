import React from 'react';
import { useStore } from '../context/StoreContext';
import { STORE_CONFIG } from '../data/initialData';
import { ShieldCheck, Lock, CheckCircle2, Award, Truck, HeartHandshake, Phone, MapPin } from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { setActiveView, t } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.nav.warranty}</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
          {t.security.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          {t.security.subtitle}
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-3xl bg-[#141624] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-base text-white">
            {t.security.card1Title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            {t.security.card1Desc}
          </p>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.common.original100}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-3xl bg-[#141624] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-base text-white">
            {t.security.card2Title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            {t.security.card2Desc}
          </p>
          <div className="text-[11px] font-mono text-red-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SHA-256 Verified</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-3xl bg-[#141624] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-base text-white">
            {t.security.card3Title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            {t.security.card3Desc} ({STORE_CONFIG.address})
          </p>
          <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RBAC Protected</span>
          </div>
        </div>
      </div>

      {/* Official Guarantee Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950/40 via-[#141624] to-[#141624] p-6 sm:p-8 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <HeartHandshake className="w-5 h-5 text-red-400" />
            <span>{t.security.guaranteeTitle}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.security.guaranteeDesc} ({STORE_CONFIG.phone})
          </p>
        </div>

        <button
          onClick={() => setActiveView('catalog')}
          className="px-6 py-3 rounded-xl bg-[#d92027] hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-red-900/40"
        >
          {t.security.backToShop}
        </button>
      </div>
    </div>
  );
};
