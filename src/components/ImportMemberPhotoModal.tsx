import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Camera,
  Check,
  Sparkles,
  Upload,
  Globe,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { IMAGES } from '../assets/images';
import { useStore } from '../context/StoreContext';

export const REAL_ALL_MEMBERS_PRESETS = [
  {
    id: 'animangaki-2024',
    title: 'Konser Live Panggung 2024 (Animangaki - Semua Member)',
    titleEn: 'Live Concert Stage 2024 (Animangaki - All Members)',
    description: 'Foto asli beresolusi tinggi seluruh member JKT48 saat tampil live di panggung konser.',
    descriptionEn: 'High-resolution real photo of all JKT48 members performing live on the concert stage.',
    imageUrl: IMAGES.allMembersStage,
    tag: 'REAL LIVE 2024'
  },
  {
    id: 'seno-closing-salute',
    title: 'Seno Closing Salute (Semua Member Teater)',
    titleEn: 'Seno Closing Salute (All Theater Members)',
    description: 'Momen asli seluruh member berbaris bersama di panggung melakukan penghormatan Seno.',
    descriptionEn: 'Authentic moment of all members lined up on stage performing the Seno closing bow.',
    imageUrl: IMAGES.allMembersSalute,
    tag: 'REAL THEATER STAGE'
  },
  {
    id: 'fortune-cookie-live',
    title: 'Koisuru Fortune Cookie Live Performance',
    titleEn: 'Koisuru Fortune Cookie Live Performance',
    description: 'Formasi Senbatsu lengkap membawakan lagu ikonik Fortune Cookie di hadapan penonton.',
    descriptionEn: 'Full Senbatsu lineup performing the iconic Fortune Cookie before a live crowd.',
    imageUrl: IMAGES.allMembersFortuneCookie,
    tag: 'REAL SENBATSU'
  },
  {
    id: 'aitakatta-matsuri',
    title: 'Aitakatta Live Concert Stage Performance',
    titleEn: 'Aitakatta Live Concert Stage Performance',
    description: 'Aksi panggung live legendaris semua member JKT48 di festival kebudayaan.',
    descriptionEn: 'Legendary live stage performance by all JKT48 members at the cultural festival.',
    imageUrl: IMAGES.allMembersAitakatta,
    tag: 'REAL CONCERT'
  },
  {
    id: 'teater-jkt48-fx',
    title: 'Teater Resmi JKT48 FX Sudirman Real Venue',
    titleEn: 'Official JKT48 Theater FX Sudirman Real Venue',
    description: 'Panggung utama teater resmi JKT48 FX Sudirman Jakarta pusat kegiatan idol.',
    descriptionEn: 'The main stage of the official JKT48 Theater at FX Sudirman Jakarta.',
    imageUrl: IMAGES.teaterReal,
    tag: 'REAL VENUE'
  }
];

interface ImportMemberPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string;
  onSavePhoto: (newPhotoUrl: string) => void;
}

export const ImportMemberPhotoModal: React.FC<ImportMemberPhotoModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto
}) => {
  const { language, t } = useStore();
  const [activeTab, setActiveTab] = useState<'presets' | 'google' | 'upload'>('presets');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhoto || IMAGES.allMembersStage);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (url: string) => {
    setSelectedPhoto(url);
    setPreviewError(false);
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setSelectedPhoto(customUrl.trim());
      setPreviewError(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
          setPreviewError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSavePhoto(selectedPhoto);
    onClose();
  };

  const handleResetDefault = () => {
    setSelectedPhoto(IMAGES.allMembersStage);
    setPreviewError(false);
  };

  const googleQueryUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('JKT48 all members stage live concert real')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#121422] border border-red-500/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161828]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white flex items-center gap-2">
                {t.importMember.title}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  REAL LIFE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.importMember.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Preview Strip */}
        <div className="bg-[#0b0c16] px-5 py-3 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-red-500 shrink-0 shadow-md">
              <img
                src={selectedPhoto}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>
                  {language === 'en' ? 'Selected Photo for "All Members"' : 'Foto yang Dipilih untuk "Semua Member"'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                {previewError ? (
                  <span className="text-amber-400">
                    {language === 'en' ? 'Unable to load URL image, please try another link' : 'URL gambar tidak dapat dimuat, gunakan link lain'}
                  </span>
                ) : (
                  language === 'en'
                    ? 'This photo will appear in the "All Members" chip and main stage billboard'
                    : 'Foto ini akan tampil di tombol filter "Semua Member" dan billboard panggung utama'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDefault}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all shrink-0"
            title={t.importMember.resetDefault}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.importMember.resetDefault}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#161828] px-5 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>
              {language === 'en' ? `Real-Life Concert Photos (${REAL_ALL_MEMBERS_PRESETS.length})` : `Foto Asli Dunia Nyata (${REAL_ALL_MEMBERS_PRESETS.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'google'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{language === 'en' ? 'Import from Google / Web URL' : 'Import dari Google / Web URL'}</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{language === 'en' ? 'Upload from File' : 'Unggah dari File'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                {t.importMember.presetsTitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REAL_ALL_MEMBERS_PRESETS.map((preset) => {
                  const isSelected = selectedPhoto === preset.imageUrl;
                  const title = language === 'en' ? preset.titleEn : preset.title;
                  const desc = language === 'en' ? preset.descriptionEn : preset.description;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.imageUrl)}
                      className={`group relative p-3 rounded-2xl border cursor-pointer transition-all flex gap-3 items-center ${
                        isSelected
                          ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/40'
                          : 'bg-[#181a2c] border-white/10 hover:border-white/30 hover:bg-[#1e2035]'
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20">
                        <img
                          src={preset.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-red-500/20 text-red-300 border border-red-500/30 mb-1">
                          {preset.tag}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate leading-snug">
                          {title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4">
              {/* Google Images Helper Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      {language === 'en' ? 'Find Photos on Google Images' : 'Cari Foto di Google Images'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {language === 'en'
                      ? 'Open Google Images with "JKT48 all members stage live concert real", right-click a photo, choose "Copy Image Address", then paste it below.'
                      : 'Buka Google Images dengan kata kunci "JKT48 all members stage live concert real", klik kanan foto dan pilih "Copy Image Address", lalu tempel tautan di bawah.'}
                  </p>
                </div>
                <a
                  href={googleQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg transition-all"
                >
                  <span>{language === 'en' ? 'Open Google Images' : 'Buka Google Images'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Paste URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  {t.importMember.urlLabel}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder={language === 'en' ? 'https://... (e.g., image URL from Google Images or Wikimedia)' : 'https://... (contoh: link gambar dari Google Images atau Wikimedia)'}
                    className="flex-1 bg-[#181a2c] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customUrl.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#d92027] hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs transition-all"
                  >
                    {language === 'en' ? 'Use' : 'Gunakan'}
                  </button>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {language === 'en' ? 'Quick Real Photo Links:' : 'Tautan Cepat Foto Asli:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Animangaki_2024_-_JKT48.jpg';
                      setCustomUrl(url);
                      setSelectedPhoto(url);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                  >
                    Animangaki 2024 Live Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = 'https://upload.wikimedia.org/wikipedia/commons/b/bc/JKT48_Doing_%22Seno%22_Closing_Salute.jpg';
                      setCustomUrl(url);
                      setSelectedPhoto(url);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                  >
                    Seno Salute Concert Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = 'https://upload.wikimedia.org/wikipedia/commons/b/b5/JKT48_Performing_Koisuru_Fortune_Cookie.jpg';
                      setCustomUrl(url);
                      setSelectedPhoto(url);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                  >
                    Fortune Cookie Live
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                {language === 'en'
                  ? 'Pick a real JKT48 photo directly from your laptop or smartphone:'
                  : 'Pilih file foto asli JKT48 langsung dari perangkat laptop atau smartphone Anda:'}
              </p>

              <label className="border-2 border-dashed border-white/20 hover:border-red-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#181a2c]/50 hover:bg-[#181a2c] transition-all">
                <div className="p-4 rounded-full bg-red-500/10 text-red-400">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white block">
                    {language === 'en' ? 'Click to select a photo from your device' : 'Klik untuk memilih foto dari perangkat Anda'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {language === 'en' ? 'Supports high-resolution JPG, PNG, WEBP' : 'Mendukung format JPG, PNG, WEBP resolusi tinggi'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#161828] flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-red-400" />
            <span>
              {language === 'en'
                ? 'Photo automatically saved for all visitors'
                : 'Foto otomatis tersimpan untuk seluruh pengunjung'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{t.importMember.saveBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

