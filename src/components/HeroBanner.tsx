import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { STORE_CONFIG } from '../data/initialData';
import { IMAGES } from '../assets/images';
import { ImportMemberPhotoModal } from './ImportMemberPhotoModal';
import { WhatsAppIcon } from './WhatsAppWidget';
import { getCategoryLabel } from '../i18n/translations';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  Radio, 
  Ticket,
  ChevronRight,
  Camera
} from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedMember: string;
  onSelectMember: (member: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  selectedCategory,
  onSelectCategory,
  selectedMember,
  onSelectMember
}) => {
  const { language, t } = useStore();
  const [semuaMemberPhoto, setSemuaMemberPhoto] = useState<string>(() => {
    return localStorage.getItem('jkt48_semua_member_photo') || IMAGES.allMembersStage;
  });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleSaveMemberPhoto = (newUrl: string) => {
    setSemuaMemberPhoto(newUrl);
    localStorage.setItem('jkt48_semua_member_photo', newUrl);
  };

  const members = [
    { 
      name: 'ALL', 
      label: t.hero.allMemberLabel, 
      avatar: semuaMemberPhoto, 
      catchphrase: t.hero.allMemberCatchphrase,
      isAll: true 
    },
    { 
      name: 'Freya Jayawardana', 
      label: 'Freya Jayawardana', 
      avatar: IMAGES.freyaRealHsf, 
      catchphrase: t.hero.favOshiCatchphrase 
    },
    { 
      name: 'Azizi Asadel (Zee)', 
      label: 'Azizi Asadel (Zee)', 
      avatar: IMAGES.zeeRealJikoshoukai, 
      catchphrase: 'Flying High' 
    },
    { 
      name: 'Angelina Christy', 
      label: 'Angelina Christy', 
      avatar: IMAGES.christyPhotopack, 
      catchphrase: 'Ramune no Nomikata' 
    },
    { 
      name: 'Shania Gracia', 
      label: 'Shania Gracia', 
      avatar: IMAGES.graciaReal, 
      catchphrase: t.hero.captainCatchphrase 
    },
    { 
      name: 'All Member', 
      label: t.hero.allMemberConcertLabel, 
      avatar: IMAGES.allMembersSalute, 
      catchphrase: t.hero.allMemberConcertCatchphrase 
    }
  ];

  const categories = [
    { id: 'ALL', label: getCategoryLabel('ALL', language) },
    { id: 'Photocard', label: getCategoryLabel('Photocard', language) },
    { id: 'Lightstick', label: getCategoryLabel('Lightstick', language) },
    { id: 'Album', label: getCategoryLabel('Album', language) },
    { id: 'T-Shirt', label: getCategoryLabel('T-Shirt', language) },
    { id: 'Accessories', label: getCategoryLabel('Accessories', language) },
    { id: 'Outerwear', label: getCategoryLabel('Outerwear', language) }
  ];

  return (
    <div className="space-y-6">
      {/* Official News Ticker (https://jkt48.com style) */}
      <div className="bg-[#181926] border-b border-red-500/20 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="bg-[#d92027] text-white font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded tracking-wider shrink-0 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            {t.hero.officialInfoBadge}
          </span>
          <div className="truncate text-slate-300 font-medium">
            {t.hero.tickerPrefix} <strong className="text-white">{STORE_CONFIG.address}</strong> (WhatsApp:{' '}
            <a 
              href={STORE_CONFIG.whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#25D366] hover:underline font-bold inline-flex items-center gap-1 font-mono"
              title="WhatsApp"
            >
              <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
              <span>{STORE_CONFIG.phone}</span>
            </a>).
          </div>
        </div>
      </div>

      {/* Main Official Stage Hero Billboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl bg-black">
          {/* Real Concert Stage Photo */}
          <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full min-h-[340px] max-h-[480px]">
            <img
              src={semuaMemberPhoto || IMAGES.allMembersStage}
              alt="JKT48 Real Live Concert Stage Performance"
              className="w-full h-full object-cover object-center"
            />
            {/* Quick Change Photo Button on Billboard */}
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
              title={t.hero.changeAllMemberTooltip}
            >
              <Camera className="w-3.5 h-3.5 text-red-400" />
              <span>{t.hero.changeAllMemberPhoto}</span>
            </button>

            {/* Dramatic Idol Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e101d] via-[#0e101d]/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e101d]/90 via-[#0e101d]/40 to-transparent pointer-events-none" />
          </div>

          {/* Hero Copy Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d92027] text-white text-xs font-mono font-bold tracking-wider w-fit shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.hero.heroStageTag}</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
              {t.hero.heroTitlePrefix}{' '}
              <span className="text-[#ff385c]">JKT48</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal drop-shadow">
              {t.hero.heroDesc}
            </p>

            {/* Store Address & Contact Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-none">{STORE_CONFIG.address}</span>
              </div>
              <a
                href={STORE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#25D366]/40 text-[#25D366] hover:text-white font-bold transition-all hover:scale-105 shadow-md group"
                title={`Chat WhatsApp Resmi: ${STORE_CONFIG.phone}`}
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] group-hover:scale-110 transition-transform" />
                <span>WA: {STORE_CONFIG.phone}</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-xl bg-[#d92027] hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>{t.hero.buyOfficialMerch}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCategory('Photocard')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all"
              >
                {t.hero.ssrCollection}
              </button>
            </div>
          </div>
        </div>

        {/* Member Oshi Selection Bar (Real Idol Profiles) */}
        <div className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                {t.hero.oshiSectionTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                title={t.hero.changeAllMemberTooltip}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.hero.changeSemuaMemberBtn}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {members.map(member => (
              <div key={member.name} className="relative group shrink-0">
                <button
                  onClick={() => onSelectMember(member.name)}
                  className={`flex items-center gap-3 p-2 pr-4 rounded-2xl border transition-all whitespace-nowrap shrink-0 ${
                    selectedMember === member.name
                      ? 'bg-[#d92027] border-red-500 text-white shadow-lg'
                      : 'bg-[#141624] border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.label}
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                    {member.isAll && (
                      <span className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] font-mono font-bold text-white px-1 rounded-full border border-black shadow">
                        REAL
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">{member.label}</div>
                    <div className={`text-[10px] font-mono ${selectedMember === member.name ? 'text-red-100' : 'text-slate-400'}`}>
                      {member.catchphrase}
                    </div>
                  </div>
                </button>

                {member.isAll && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPhotoModalOpen(true);
                    }}
                    className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md border border-white/30 opacity-80 hover:opacity-100 transition-all hover:scale-110"
                    title="Ganti Foto Semua Member"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter Pills (jkt48.com style) */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                selectedCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-md font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Import/Ganti Foto Semua Member */}
      <ImportMemberPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={semuaMemberPhoto}
        onSavePhoto={handleSaveMemberPhoto}
      />
    </div>
  );
};
