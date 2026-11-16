import React, { useState } from 'react';
import { Product } from '../types';
import { formatIDR } from '../utils/crypto';
import { useStore } from '../context/StoreContext';
import { STORE_CONFIG } from '../data/initialData';
import { WhatsAppIcon } from './WhatsAppWidget';
import { getCategoryLabel, getLocalizedProduct } from '../i18n/translations';
import { X, ShoppingBag, Zap, Check, ShieldCheck, Sparkles, MapPin, Phone, Camera } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantBuy: (product: Product, quantity: number, size?: string) => void;
  onOpenImportImage?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantBuy,
  onOpenImportImage
}) => {
  const { addToCart, setIsCartOpen, language, t } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const localized = getLocalizedProduct(product, language);
  const isWearable = product.category === 'T-Shirt' || product.category === 'Outerwear';
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    addToCart(product, quantity, isWearable ? selectedSize : undefined);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, isWearable ? selectedSize : undefined);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#121422] border border-red-500/30 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-red-500/20 text-slate-400 hover:text-white border border-white/10 transition-colors"
          aria-label="Tutup Detail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section */}
        <div className="md:w-1/2 relative bg-black/50 min-h-[300px] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/10">
          <img
            src={product.imageUrl}
            alt={localized.name}
            className="w-full h-auto max-h-[320px] object-contain rounded-2xl shadow-2xl"
          />
          {localized.badge && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-[#d92027] text-white shadow-lg">
                <Sparkles className="w-3 h-3" />
                {localized.badge}
              </span>
            </div>
          )}

          {onOpenImportImage && (
            <button
              onClick={() => onOpenImportImage(product)}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-600/80 text-slate-200 hover:text-white text-xs font-mono border border-white/15 hover:border-red-500 transition-all shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-red-400" />
              {language === 'en' ? 'Replace / Import Photo (Google/Preset)' : 'Ganti / Import Gambar (Google/Preset)'}
            </button>
          )}
        </div>

        {/* Right Details Section */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20 uppercase">
                {getCategoryLabel(product.category, language)}
              </span>
              <span>•</span>
              <span className="text-white font-semibold">{product.memberTag || 'All Member JKT48'}</span>
            </div>

            <h3 className="font-display font-black text-xl sm:text-2xl text-white leading-tight">
              {localized.name}
            </h3>

            <div className="flex items-baseline gap-3">
              <span className="font-display font-black text-2xl text-white">
                {formatIDR(product.price)}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {language === 'en'
                  ? `Stock: ${product.stock} pcs available`
                  : `Stok: ${product.stock} pcs tersedia`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {localized.description}
            </p>

            {/* Store Location Info Badge */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{language === 'en' ? 'Shipping & Store Pickup:' : 'Pengiriman & Pengambilan Toko:'}</span>
              </div>
              <div className="font-mono text-slate-400">{STORE_CONFIG.address}</div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-mono text-[11px]">{language === 'en' ? 'CS Chat:' : 'Chat CS:'}</span>
                <a
                  href={`https://wa.me/${STORE_CONFIG.phone}?text=${encodeURIComponent(`Halo Admin JKT48, saya ingin bertanya tentang stok produk "${product.name}".`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 font-mono text-[11px] font-bold transition-all shadow-sm group"
                  title="WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] group-hover:text-slate-950" />
                  <span>WA {STORE_CONFIG.phone}</span>
                </a>
              </div>
            </div>

            {/* Size Selector */}
            {isWearable && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  {t.product.selectSize}
                </label>
                <div className="flex gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-[#d92027] text-white border border-red-400 shadow-md'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                {t.product.quantity}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-white/15 rounded-xl bg-black/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-l-xl transition-colors font-mono"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-mono font-bold text-white min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-r-xl transition-colors font-mono disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  {t.common.subtotal}: <strong className="text-white">{formatIDR(product.price * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Specs */}
            {localized.specs && localized.specs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {t.product.specsTitle}
                </div>
                <ul className="grid grid-cols-1 gap-1 text-xs text-slate-300">
                  {localized.specs.map((sp, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{sp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                addedAnimation
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === 'en' ? 'Added!' : 'Dimasukkan!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-red-400" />
                  <span>{t.product.addToCart}</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#d92027] hover:bg-red-600 text-white shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
            >
              <Zap className="w-4 h-4" />
              <span>{t.product.buyNow}</span>
            </button>

            <a
              href={`https://wa.me/${STORE_CONFIG.phone}?text=${encodeURIComponent(`Halo Admin JKT48 Official, saya ingin bertanya mengenai produk: "${product.name}" seharga Rp ${product.price.toLocaleString('id-ID')}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 border border-[#25D366]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              title={t.product.askWa}
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'Ask WA' : 'Tanya WA'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
