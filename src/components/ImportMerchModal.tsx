import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_MERCH_PRESETS, MerchPresetImage } from '../assets/images';
import { getCategoryLabel, getLocalizedProduct } from '../i18n/translations';
import {
  X,
  ExternalLink,
  Search,
  Sparkles,
  Check,
  Image as ImageIcon,
  Globe,
  CheckCircle2,
  RefreshCw,
  Camera
} from 'lucide-react';

interface ImportMerchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
}

export const ImportMerchModal: React.FC<ImportMerchModalProps> = ({
  isOpen,
  onClose,
  targetProduct
}) => {
  const { products, updateProduct, addToast, language, t } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync selected product when modal opens or targetProduct changes
  useEffect(() => {
    if (targetProduct) {
      setSelectedProductId(targetProduct.id);
      setPreviewUrl(targetProduct.imageUrl);
      setCustomUrl(targetProduct.imageUrl);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
      setPreviewUrl(products[0].imageUrl);
      setCustomUrl(products[0].imageUrl);
    }
  }, [targetProduct, products, isOpen, selectedProductId]);

  // When changing product in dropdown, update preview
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setPreviewUrl(prod.imageUrl);
      setCustomUrl(prod.imageUrl);
      setImageError(false);
    }
  };

  const handleSelectPreset = (preset: MerchPresetImage) => {
    setSelectedPresetId(preset.id);
    setPreviewUrl(preset.imageUrl);
    setCustomUrl(preset.imageUrl);
    setImageError(false);
  };

  const handleCustomUrlChange = (val: string) => {
    setCustomUrl(val);
    setPreviewUrl(val);
    setImageError(false);
    setSelectedPresetId('');
  };

  const currentProduct = products.find(p => p.id === selectedProductId);
  const localizedCurrent = currentProduct ? getLocalizedProduct(currentProduct, language) : null;

  const googleSearchQuery = currentProduct
    ? `official merchandise JKT48 ${currentProduct.category} ${currentProduct.memberTag !== 'All Member' ? currentProduct.memberTag : ''}`
    : 'official merchandise JKT48 photopack kaos lightstick';
  const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(googleSearchQuery.trim())}`;

  const handleApply = async () => {
    if (!selectedProductId) {
      addToast(
        language === 'en' ? 'Error' : 'Error',
        language === 'en' ? 'Please select a product first' : 'Pilih produk yang ingin diubah terlebih dahulu',
        'error'
      );
      return;
    }
    if (!previewUrl || previewUrl.trim() === '') {
      addToast(
        language === 'en' ? 'Error' : 'Error',
        language === 'en' ? 'Select a preset or enter a valid image URL' : 'Pilih preset atau masukkan URL gambar yang valid',
        'error'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProduct(selectedProductId, {
        imageUrl: previewUrl.trim()
      });
      addToast(
        language === 'en' ? 'Image Imported!' : 'Gambar Berhasil Diimport!',
        language === 'en'
          ? `Product image for "${localizedCurrent?.name?.slice(0, 32)}..." has been updated.`
          : `Gambar produk "${currentProduct?.name?.slice(0, 32)}..." telah diperbarui dari sumber resmi.`,
        'success'
      );
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
      addToast(
        language === 'en' ? 'Failed' : 'Gagal',
        language === 'en' ? 'Failed to update product image' : 'Terjadi kesalahan saat memperbarui gambar produk',
        'error'
      );
    }
  };

  if (!isOpen) return null;

  const categories = ['ALL', 'Photocard', 'T-Shirt', 'Lightstick', 'Album', 'Accessories', 'Stage'];
  const filteredPresets = selectedCategory === 'ALL'
    ? OFFICIAL_MERCH_PRESETS
    : OFFICIAL_MERCH_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#141624] border border-red-500/30 shadow-2xl shadow-red-950/50 flex flex-col max-h-[90vh] overflow-hidden text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                {t.importMerch.title}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/30">
                  OFFICIAL / GOOGLE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.importMerch.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Step 1: Select Target Product */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>{t.importMerch.targetLabel}</span>
              <span className="text-red-400 font-bold">
                {products.length} {language === 'en' ? 'Products Available' : 'Produk Tersedia'}
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={e => handleProductChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      [{getCategoryLabel(p.category, language)}] {getLocalizedProduct(p, language).name}
                    </option>
                  ))}
                </select>
              </div>

              {currentProduct && localizedCurrent && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
                  <img
                    src={currentProduct.imageUrl}
                    alt={localizedCurrent.name}
                    className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-white/10"
                  />
                  <div className="truncate text-xs">
                    <div className="text-white font-medium truncate">{localizedCurrent.name}</div>
                    <div className="text-[10px] text-red-400 font-mono">{getCategoryLabel(currentProduct.category, language)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'en'
                  ? `Official Presets (${OFFICIAL_MERCH_PRESETS.length})`
                  : `Koleksi Preset Merch Asli (${OFFICIAL_MERCH_PRESETS.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'url'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                {language === 'en' ? 'Paste URL / Google Images' : 'Input Link / Google Images'}
              </button>
            </div>

            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              {language === 'en' ? 'Search Google Images' : 'Cari di Google Images'}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Tab 1: Presets Gallery */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat === 'ALL' ? t.catalog.allCategories : getCategoryLabel(cat, language)}
                  </button>
                ))}
              </div>

              {/* Grid of Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredPresets.map(preset => {
                  const isSelected = selectedPresetId === preset.id || previewUrl === preset.imageUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-500 ring-2 ring-red-500/50 bg-red-950/20 shadow-md'
                          : 'border-white/10 bg-slate-900/60 hover:border-white/30'
                      }`}
                    >
                      <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
                        <img
                          src={preset.imageUrl}
                          alt={preset.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-slate-200 border border-white/10">
                          {getCategoryLabel(preset.category, language)}
                        </span>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <div className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-red-400">
                          {preset.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {preset.source}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Custom URL & Google Images Link */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Search className="w-4 h-4" />
                  {language === 'en' ? 'Quick Guide to Import from Google:' : 'Cara Cepat Ambil Gambar dari Google:'}
                </div>
                {language === 'en' ? (
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Click <span className="text-amber-400 font-bold">"Search Google Images"</span> above.</li>
                    <li>Pick your preferred official JKT48 merchandise photo.</li>
                    <li>Right-click the image &gt; select <span className="text-white font-bold">"Copy image address"</span>.</li>
                    <li>Paste the copied URL into the field below.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Klik tombol <span className="text-amber-400 font-bold">"Cari di Google Images"</span> di kanan atas.</li>
                    <li>Pilih gambar merchandise resmi JKT48 yang kamu suka.</li>
                    <li>Klik kanan pada gambar &gt; pilih <span className="text-white font-bold">"Salin alamat gambar" (Copy image address)</span>.</li>
                    <li>Tempelkan (Paste) link gambar tersebut ke input di bawah ini.</li>
                  </ol>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  {t.importMerch.urlLabel}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={e => handleCustomUrlChange(e.target.value)}
                    placeholder={language === 'en' ? 'https://... (image link from Google, Wikimedia, etc.)' : 'https://... (contoh: link gambar dari Google, Tokopedia, Wikimedia)'}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                  />
                  {customUrl && (
                    <button
                      type="button"
                      onClick={() => handleCustomUrlChange('')}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs"
                    >
                      {language === 'en' ? 'Clear' : 'Hapus'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Container */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-black/30 border border-white/10">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[9px] mt-1">{language === 'en' ? 'None' : 'Belum Ada'}</span>
                  </div>
                )}
                {imageError && (
                  <div className="absolute inset-0 bg-red-950/90 text-red-300 flex items-center justify-center text-[10px] text-center p-1 font-mono">
                    {language === 'en' ? 'Failed to load URL' : 'Gagal memuat URL'}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {language === 'en' ? 'Preview for:' : 'Pratinjau untuk:'}{' '}
                  <span className="text-white font-bold">{localizedCurrent?.name || (language === 'en' ? 'Select Product' : 'Pilih Produk')}</span>
                </div>
                <div className="text-xs text-slate-300 break-all font-mono line-clamp-2">
                  {previewUrl || (language === 'en' ? 'Choose a preset or paste an image URL' : 'Pilih salah satu preset atau tempel URL')}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Official merchandise format supported' : 'Format resmi merchandise didukung'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            {t.common.cancel}
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting || !previewUrl || imageError}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              isSubmitting || !previewUrl || imageError
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#d92027] hover:bg-red-600 text-white shadow-red-950/40 hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.common.saving}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{t.importMerch.applyBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

