import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { IMAGES } from '../assets/images';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Image as ImageIcon,
  User as UserIcon,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { UserAvatar, isLegacyStockAvatar } from './UserAvatar';

const JKT48_AVATAR_PRESETS = [
  {
    id: 'freya-hsf',
    name: 'Freya Jayawardana',
    title: 'Joy Kick Tears Special Edition',
    url: IMAGES.freyaRealHsf
  },
  {
    id: 'freya-stage',
    name: 'Freya Jayawardana',
    title: 'Stage Performance',
    url: IMAGES.freyaRealStage
  },
  {
    id: 'zee-jiko',
    name: 'Azizi Asadel (Zee)',
    title: 'Flying High Live Jikoshoukai',
    url: IMAGES.zeeRealJikoshoukai
  },
  {
    id: 'gracia-captain',
    name: 'Shania Gracia',
    title: 'Kapten JKT48 Teater',
    url: IMAGES.graciaReal
  },
  {
    id: 'all-members-live',
    name: 'Semua Member JKT48',
    title: 'Animangaki 2024 Concert Stage',
    url: IMAGES.allMembersStage
  },
  {
    id: 'seno-salute',
    name: 'Semua Member JKT48',
    title: 'Seno Closing Salute Teater',
    url: IMAGES.allMembersSalute
  },
  {
    id: 'adel-kitsune',
    name: 'Reva Fidela (Adel)',
    title: 'Signature Kitsune Sign',
    url: IMAGES.adelRealKitsune
  },
  {
    id: 'gita-fiony',
    name: 'Gita & Fiony JKT48',
    title: 'Duo Idol Stage',
    url: IMAGES.gitaFionyReal
  },
  {
    id: 'jkt48-logo-official',
    name: 'Logo Resmi JKT48',
    title: 'Official Red Crest Emblem',
    url: IMAGES.jkt48Logo
  }
];

export const ChangeAvatarModal: React.FC = () => {
  const { currentUser, isAvatarModalOpen, setIsAvatarModalOpen, updateUserAvatar, language, t } = useStore();

  const [activeTab, setActiveTab] = useState<'url' | 'device' | 'presets'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: string; type: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected avatar when modal opens
  useEffect(() => {
    if (isAvatarModalOpen && currentUser) {
      const current = currentUser.avatar && !isLegacyStockAvatar(currentUser.avatar) ? currentUser.avatar : '';
      setSelectedAvatar(current);
      setUrlInput(current.startsWith('data:') ? '' : current);
      setPreviewStatus('idle');
      setErrorMessage('');
      setFileMeta(null);
    }
  }, [isAvatarModalOpen, currentUser]);

  if (!isAvatarModalOpen || !currentUser) return null;

  // Validate if URL contains common image extensions or protocols
  const isImagePattern = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return (
      lower.includes('.jpg') ||
      lower.includes('.jpeg') ||
      lower.includes('.png') ||
      lower.includes('.webp') ||
      lower.includes('.gif') ||
      lower.startsWith('data:image/') ||
      lower.includes('images.unsplash.com') ||
      lower.includes('upload.wikimedia.org') ||
      lower.includes('googleusercontent.com') ||
      lower.includes('imgur.com')
    );
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage(t.avatar.invalidUrlError);
      setPreviewStatus('error');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setErrorMessage(t.avatar.invalidUrlError);
      setPreviewStatus('error');
      return;
    }

    setPreviewStatus('loading');
    setErrorMessage('');
    setSelectedAvatar(trimmed);
    setFileMeta(null);
  };

  const handleImageLoad = () => {
    setPreviewStatus('success');
    setErrorMessage('');
  };

  const handleImageError = () => {
    setPreviewStatus('error');
    setErrorMessage(t.avatar.loadError);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setErrorMessage(t.avatar.invalidFileError);
      setPreviewStatus('error');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(language === 'en' ? 'File too large. Maximum image size is 15MB.' : 'Ukuran file terlalu besar. Maksimal ukuran gambar adalah 15MB.');
      setPreviewStatus('error');
      return;
    }

    const reader = new FileReader();
    setPreviewStatus('loading');
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          // Compress & resize to max 512x512 so localStorage & JSON DB stay fast & reliable
          const maxDim = 512;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const mimeOut = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const compressedDataUrl = canvas.toDataURL(mimeOut, 0.85);
            const approxKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
            setSelectedAvatar(compressedDataUrl);
            setPreviewStatus('success');
            setErrorMessage('');
            setFileMeta({
              name: file.name,
              size: `${approxKb} KB (dioptimasi)`,
              type: mimeOut
            });
          } else {
            setSelectedAvatar(reader.result as string);
            setPreviewStatus('success');
          }
        };
        img.onerror = () => {
          setPreviewStatus('error');
          setErrorMessage('File gambar tidak dapat diproses. Pastikan file bukan dokumen rusak.');
        };
        img.src = reader.result;
      }
    };
    reader.onerror = () => {
      setPreviewStatus('error');
      setErrorMessage('Gagal membaca file dari perangkat.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetUrl: string) => {
    setSelectedAvatar(presetUrl);
    setUrlInput(presetUrl.startsWith('http') ? presetUrl : '');
    setPreviewStatus('success');
    setErrorMessage('');
    setFileMeta(null);
  };

  const handleSave = async () => {
    if (previewStatus === 'error') {
      setErrorMessage('Foto tidak dapat disimpan karena link atau file gambar bermasalah.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUserAvatar(selectedAvatar);
      setIsAvatarModalOpen(false);
    } catch {
      // Error handled by store toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGoogleSearch = () => {
    const q = encodeURIComponent('jkt48 member photopack profile avatar jpg');
    window.open(`https://www.google.com/search?tbm=isch&q=${q}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#121422] border border-red-500/30 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
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
                {t.avatar.title}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  JPG • PNG • JPEG
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.avatar.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAvatarModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current & Preview Avatar Banner */}
        <div className="bg-[#0b0c16] px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Live New Avatar Preview */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500 shadow-xl bg-slate-900 shrink-0">
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar}
                    alt="Preview Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                ) : (
                  <UserAvatar
                    name={currentUser.name}
                    username={currentUser.username}
                    isAdmin={currentUser.role === 'admin'}
                    className="w-full h-full"
                    textClassName="text-xl"
                  />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded-full border border-black shadow">
                {language === 'en' ? 'NEW' : 'BARU'}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{currentUser.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                  @{currentUser.username}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {previewStatus === 'loading' && (
                  <span className="text-blue-400 font-mono flex items-center gap-1">
                    {language === 'en' ? 'Verifying image...' : 'Sedang memverifikasi gambar...'}
                  </span>
                )}
                {previewStatus === 'success' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Valid image & ready to apply' : 'Gambar valid & siap diterapkan'}
                  </span>
                )}
                {previewStatus === 'error' && (
                  <span className="text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Invalid image format or URL' : 'Format atau link gambar tidak valid'}
                  </span>
                )}
                {previewStatus === 'idle' && (
                  <span>{language === 'en' ? 'Pick a tab below to update your profile photo.' : 'Pilih tab di bawah untuk mengubah foto profil Anda.'}</span>
                )}
              </p>
              {fileMeta && (
                <div className="text-[10px] font-mono text-emerald-300 flex items-center gap-2">
                  <span>File: {fileMeta.name}</span>
                  <span>•</span>
                  <span>{fileMeta.size}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reset & Initials buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedAvatar('');
                setUrlInput('');
                setFileMeta(null);
                setErrorMessage('');
                setPreviewStatus('success');
              }}
              className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
              title={language === 'en' ? 'Use name initials (no photo)' : 'Gunakan inisial nama (tanpa foto)'}
            >
              {language === 'en' ? 'Initials' : 'Inisial Nama'}
            </button>
            <button
              type="button"
              onClick={() => {
                const orig = currentUser.avatar && !isLegacyStockAvatar(currentUser.avatar) ? currentUser.avatar : '';
                setSelectedAvatar(orig);
                setUrlInput(orig.startsWith('http') ? orig : '');
                setFileMeta(null);
                setErrorMessage('');
                setPreviewStatus('idle');
              }}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
              title={language === 'en' ? 'Restore current photo' : 'Kembalikan ke foto saat ini'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'en' ? 'Reset' : 'Kembalikan Awal'}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-[#161828] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'url'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-blue-400" />
            <span>{t.avatar.urlTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'device'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{t.avatar.uploadTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.avatar.presetTab}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: URL INPUT */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      {language === 'en' ? 'Paste Any Direct Image Link' : 'Masukkan Link Gambar Bebas'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {t.avatar.urlHint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openGoogleSearch}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow"
                >
                  <span>{language === 'en' ? 'Search Google' : 'Cari di Google'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  {t.avatar.urlLabel}:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        if (isImagePattern(e.target.value)) {
                          setSelectedAvatar(e.target.value.trim());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyUrl();
                        }
                      }}
                      placeholder={t.avatar.urlPlaceholder}
                      className="w-full bg-[#181a2c] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    {isImagePattern(urlInput) && (
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        DETECTED
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-5 py-2.5 rounded-xl bg-[#d92027] hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all shrink-0"
                  >
                    {language === 'en' ? 'Preview' : 'Tinjau'}
                  </button>
                </div>
              </div>

              {/* Format Hints */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  {language === 'en' ? 'Supported:' : 'Format didukung:'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">.JPG</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">.PNG</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">.JPEG</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">.WEBP</span>
              </div>

              {/* Quick Sample Links */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {language === 'en' ? 'Quick JKT48 Picks:' : 'Contoh Pilihan Cepat JKT48:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(IMAGES.freyaRealHsf)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    Freya HSF (JPG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(IMAGES.graciaReal)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    Shania Gracia (JPG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(IMAGES.jkt48Logo)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    Official JKT48 Logo (PNG)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEVICE UPLOAD */}
          {activeTab === 'device' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-red-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#181a2c]/50 hover:bg-[#181a2c] transition-all group"
              >
                <div className="p-4 rounded-2xl bg-red-600/10 group-hover:bg-red-600/20 text-red-400 group-hover:scale-110 transition-all">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-sm font-bold text-white block">
                    {t.avatar.uploadDropTitle}
                  </span>
                  <p className="text-xs text-slate-400">
                    {t.avatar.uploadDropSub}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      .JPG, .JPEG, .PNG, .WEBP
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      Max: 15MB
                    </span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {fileMeta && (
                <div className="p-4 rounded-2xl bg-[#161828] border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{fileMeta.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {fileMeta.size} • {fileMeta.type}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-red-400 hover:text-red-300 underline font-semibold"
                  >
                    {language === 'en' ? 'Replace File' : 'Ganti File'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: JKT48 PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                {t.avatar.presetTitle}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {JKT48_AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`group relative p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                        isSelected
                          ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/40'
                          : 'bg-[#181a2c] border-white/10 hover:border-white/30 hover:bg-[#1e2035]'
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2 border border-white/20">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-white truncate max-w-full">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-full">
                        {preset.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#161828] flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'en' ? 'Automatically saved to your account' : 'Tersimpan otomatis ke database akun'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || previewStatus === 'error'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? t.avatar.saving : t.avatar.saveAvatar}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
