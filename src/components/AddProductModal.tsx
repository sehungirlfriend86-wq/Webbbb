import React, { useState, useRef } from 'react';
import { ProductCategory } from '../types';
import { useStore } from '../context/StoreContext';
import { getCategoryLabel } from '../i18n/translations';
import { X, Upload, Link as LinkIcon, Plus, Sparkles, Check, ExternalLink, Search } from 'lucide-react';
import { OFFICIAL_MERCH_PRESETS } from '../assets/images';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, addToast, language, t } = useStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Accessories');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(25);
  const [description, setDescription] = useState('');
  const [memberTag, setMemberTag] = useState('All Member');
  const [badge, setBadge] = useState('NEW RELEASE');
  const [specsInput, setSpecsInput] = useState('');

  // Image source mode: 'url' vs 'file'
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories: ProductCategory[] = [
    'T-Shirt',
    'Album',
    'Photocard',
    'Lightstick',
    'Outerwear',
    'Accessories',
    'Theater Exclusive',
    'Other'
  ];

  // Handle local file selection (PNG, JPG, JPEG)
  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpe?g)$/i) && !file.name.match(/\.(png|jpe?g)$/i)) {
      const msg = language === 'en' ? 'File format must be PNG, JPG, or JPEG.' : 'Format file harus berupa PNG, JPG, atau JPEG.';
      setErrorMsg(msg);
      addToast(language === 'en' ? 'Invalid Format' : 'Format Tidak Valid', msg, 'error');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) {
      const msg = language === 'en' ? 'Product name is required.' : 'Nama produk wajib diisi.';
      setErrorMsg(msg);
      return;
    }
    if (!price || Number(price) <= 0) {
      const msg = language === 'en' ? 'Please enter a valid product price.' : 'Harga produk tidak valid.';
      setErrorMsg(msg);
      return;
    }
    if (!imageUrl.trim()) {
      const msg = language === 'en'
        ? 'Product image is required (via URL or file upload).'
        : 'Gambar produk wajib dimasukkan (via URL atau file upload).';
      setErrorMsg(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const specs = specsInput
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      await addProduct({
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock) || 0,
        description: description.trim() || (language === 'en'
          ? `Official JKT48 merchandise in ${getCategoryLabel(category, 'en')} category.`
          : `Merchandise resmi JKT48 kategori ${category}.`),
        imageUrl: imageUrl.trim(),
        memberTag: memberTag.trim() || 'All Member',
        badge: badge.trim() || 'OFFICIAL',
        specs: specs.length > 0 ? specs : ['Official Merchandise JKT48', 'Anti-Counterfeit Hologram Tag']
      });

      onClose();
      setName('');
      setPrice('');
      setStock(25);
      setDescription('');
      setImageUrl('');
      setImagePreview(null);
      setSpecsInput('');
      setErrorMsg(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === 'en' ? 'Failed to add product' : 'Gagal menambahkan produk');
      setErrorMsg(msg);
      addToast(language === 'en' ? 'Error' : 'Gagal', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample quick image fillers for convenience
  const quickFillSample = (type: string) => {
    setErrorMsg(null);
    if (type === 'tshirt') {
      setName(language === 'en' ? 'JKT48 13th Anniversary Wonder Gala Concert T-Shirt' : 'Kaos Konser JKT48 13th Anniversary Wonder Gala');
      setCategory('T-Shirt');
      setPrice(195000);
      setStock(50);
      setDescription(language === 'en'
        ? 'Special Wonder Gala concert edition T-shirt made with 24s Combed Cotton.'
        : 'Kaos edisi spesial konser Wonder Gala dengan bahan Cotton Combed 24s.');
      setImageUrl('/src/assets/images/jkt48_anniv_tshirt_1791894992130.jpg');
      setImagePreview('/src/assets/images/jkt48_anniv_tshirt_1791894992130.jpg');
      setMemberTag('All Member');
      setBadge('CONCERT EXCLUSIVE');
    } else if (type === 'photocard') {
      setName(language === 'en' ? 'Official JKT48 Photopack Freya Jayawardana (Special Edition)' : 'Official JKT48 Photopack Freya Jayawardana (Special Edition)');
      setCategory('Photocard');
      setPrice(85000);
      setStock(100);
      setDescription(language === 'en'
        ? 'Official Freya Jayawardana photopack in red tartan seifuku with gold foil guarantee.'
        : 'Photopack resmi Freya Jayawardana edisi seifuku tartan merah bergaransi foil emas.');
      setImageUrl('/src/assets/images/real/freya_hsf.jpg');
      setImagePreview('/src/assets/images/real/freya_hsf.jpg');
      setMemberTag('Freya Jayawardana');
      setBadge('SSR INCLUDED');
    }
  };

  const googleSearchQuery = `official merchandise JKT48 ${category} ${name}`.trim();
  const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(googleSearchQuery)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0f111e] border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {t.addProduct.title}
              </h3>
              <p className="text-xs text-slate-400">
                {t.addProduct.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Quick preset bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 bg-white/5 p-2 px-3 rounded-xl border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{language === 'en' ? 'Quick Preset:' : 'Preset Cepat:'}</span>
            <button
              type="button"
              onClick={() => quickFillSample('tshirt')}
              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-mono"
            >
              {language === 'en' ? '+ Sample T-Shirt' : '+ Contoh Kaos'}
            </button>
            <button
              type="button"
              onClick={() => quickFillSample('photocard')}
              className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[11px] font-mono"
            >
              {language === 'en' ? '+ Sample Photocard' : '+ Contoh Photocard'}
            </button>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              {t.addProduct.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.addProduct.namePlaceholder}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                {t.addProduct.categoryLabel}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                {t.addProduct.badgeLabel}
              </label>
              <input
                type="text"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder={t.addProduct.badgePlaceholder}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                {t.addProduct.priceLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="1000"
                  value={price}
                  onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="150000"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                {t.addProduct.stockLabel}
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Member / Oshi Tag */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              {t.addProduct.memberTagLabel}
            </label>
            <input
              type="text"
              value={memberTag}
              onChange={e => setMemberTag(e.target.value)}
              placeholder={language === 'en' ? 'Example: Freya, Zee, Christy, Gracia, All Member' : 'Contoh: Freya, Zee, Christy, Gracia, All Member'}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-all"
            />
          </div>

          {/* IMAGE INPUT: URL OR FILE UPLOAD */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase text-slate-300">
                {t.addProduct.imageUrlLabel} <span className="text-rose-500">*</span>
              </label>
              {/* Toggle Mode */}
              <div className="flex p-0.5 rounded-lg bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono flex items-center gap-1 transition-all ${
                    imageMode === 'url' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  {language === 'en' ? 'Image URL' : 'Link URL'}
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono flex items-center gap-1 transition-all ${
                    imageMode === 'file' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  {language === 'en' ? 'Upload File (.PNG/.JPG)' : 'Upload File (.PNG/.JPG)'}
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder={language === 'en' ? 'https://... or paste image link from Google' : 'https://... atau tempel alamat gambar dari Google'}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-all font-mono"
                  />
                  <a
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                    title={language === 'en' ? 'Search on Google Images' : 'Buka pencarian Google Images'}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Google Images</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Quick Presets Selection Grid */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono text-slate-400">
                    {language === 'en' ? 'Or pick from official collection presets:' : 'Atau pilih dari preset koleksi resmi:'}
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1.5">
                    {OFFICIAL_MERCH_PRESETS.slice(0, 8).map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.imageUrl);
                          setImagePreview(preset.imageUrl);
                        }}
                        className={`shrink-0 flex items-center gap-1.5 p-1.5 pr-2.5 rounded-lg border text-[11px] transition-all ${
                          imageUrl === preset.imageUrl
                            ? 'bg-rose-500/20 border-rose-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <img src={preset.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />
                        <span className="max-w-[100px] truncate">{preset.title.split('(')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-white/15 bg-white/[0.02] hover:border-rose-500/50 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">
                    {language === 'en'
                      ? 'Click to select a file from your computer / gallery or drag & drop here'
                      : 'Klik untuk memilih file dari komputer / galeri atau seret file ke sini'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {language === 'en' ? 'Supports PNG, JPG, JPEG formats (Max 15MB)' : 'Mendukung format PNG, JPG, JPEG (Maks. 15MB)'}
                  </div>
                </div>
              </div>
            )}

            {/* Live Image Preview */}
            {imagePreview && (
              <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-rose-500/40"
                  onError={() => setImagePreview(null)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Image Ready to Save' : 'Gambar Siap Disimpan'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {imageMode === 'url'
                      ? imageUrl
                      : (language === 'en' ? 'Uploaded file decoded (Base64 Data)' : 'File upload berhasil di-decode (Base64 Data)')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImagePreview(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1"
                >
                  {language === 'en' ? 'Remove' : 'Hapus'}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              {t.addProduct.descLabel}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={language === 'en'
                ? 'Describe material, color, theater edition, and merchandise details...'
                : 'Jelaskan detail bahan, warna, edisi teater, dan keunikan merchandise...'}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-all resize-none"
            />
          </div>

          {/* Bullet Specifications */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              {t.addProduct.specsLabel}
            </label>
            <textarea
              rows={2}
              value={specsInput}
              onChange={e => setSpecsInput(e.target.value)}
              placeholder={language === 'en'
                ? 'Example:\n24s Heavyweight Combed Cotton\nGlow Discharge Print\nOfficial JKT48 Hologram Seal'
                : 'Contoh:\nBahan Cotton Combed 24s Heavyweight\nSablon Reflective Glow Discharge\nOfficial JKT48 Hologram Seal'}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 transition-all font-mono resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t.addProduct.submitting}</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.addProduct.submitBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

