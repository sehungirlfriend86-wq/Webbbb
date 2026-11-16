import React from 'react';
import { Product } from '../types';
import { formatIDR } from '../utils/crypto';
import { useStore } from '../context/StoreContext';
import { getCategoryLabel, getLocalizedProduct } from '../i18n/translations';
import { ShoppingBag, Eye, Sparkles, Check, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onOpenImportImage?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetail,
  onOpenImportImage 
}) => {
  const { addToCart, language, t } = useStore();
  const [justAdded, setJustAdded] = React.useState(false);
  const localized = getLocalizedProduct(product, language);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleImportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenImportImage) {
      onOpenImportImage(product);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onViewDetail(product)}
      className="group relative rounded-2xl bg-[#141624] border border-white/10 hover:border-red-500/60 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141624] via-transparent to-transparent opacity-60" />

        {/* Badge (jkt48.com red idol style) */}
        {localized.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#d92027] text-white shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              {localized.badge}
            </span>
          </div>
        )}

        {/* Member / Oshi Tag & Image Import Button */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {product.memberTag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/75 text-red-200 backdrop-blur-md border border-red-500/30">
              {product.memberTag}
            </span>
          )}
          {onOpenImportImage && (
            <button
              onClick={handleImportClick}
              title={t.product.importTooltip}
              className="p-1.5 rounded-md bg-black/75 hover:bg-red-600 text-slate-300 hover:text-white backdrop-blur-md border border-white/20 hover:border-red-500 transition-colors shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/45 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/30 shadow-xl">
            <Eye className="w-3.5 h-3.5" />
            {language === 'en' ? 'Specs' : 'Spesifikasi'}
          </span>
          {onOpenImportImage && (
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold backdrop-blur-md border border-red-500/50 shadow-xl"
            >
              {language === 'en' ? 'Change Photo' : 'Ganti Gambar'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="text-red-400 font-bold uppercase tracking-wider">{getCategoryLabel(product.category, language)}</span>
            <span className={product.stock <= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {isOutOfStock ? t.common.outOfStock : `${language === 'en' ? 'Stock' : 'Stok'}: ${product.stock} ${t.common.pcs}`}
            </span>
          </div>

          <h4 className="font-display font-bold text-sm sm:text-base text-white line-clamp-2 group-hover:text-red-400 transition-colors">
            {localized.name}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2 font-normal leading-relaxed">
            {localized.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">{t.product.officialPrice}</div>
            <div className="font-display font-black text-base sm:text-lg text-white">
              {formatIDR(product.price)}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                : 'bg-[#d92027] hover:bg-red-600 text-white shadow-red-950/40 hover:scale-105 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Added!' : 'Masuk!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'en' ? '+ Add' : '+ Beli'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
