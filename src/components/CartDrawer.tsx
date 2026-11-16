import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR } from '../utils/crypto';
import { getCategoryLabel, getLocalizedProduct } from '../i18n/translations';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: (promoData: { promoCode: string; discountAmount: number }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addToast,
    language,
    t
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; type: 'fixed' | 'percent' } | null>(null);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedPromo.discount) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedPromo.discount);
    }
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'JKT48NEWERA') {
      setAppliedPromo({ code, discount: 10, type: 'percent' });
      addToast(
        t.cart.promoAppliedTitle,
        language === 'en' ? '10% discount has been applied to your cart.' : 'Diskon 10% berhasil dipotong dari total belanja.',
        'success'
      );
    } else if (code === 'WOTA2026') {
      setAppliedPromo({ code, discount: 25000, type: 'fixed' });
      addToast(
        t.cart.promoAppliedTitle,
        language === 'en' ? 'IDR 25,000 discount activated.' : 'Potongan Rp 25.000 berhasil diaktifkan.',
        'success'
      );
    } else if (code === 'FREESHIP') {
      setAppliedPromo({ code, discount: 20000, type: 'fixed' });
      addToast(
        t.cart.promoAppliedTitle,
        language === 'en' ? 'IDR 20,000 shipping discount applied.' : 'Potongan Rp 20.000 diterapkan.',
        'success'
      );
    } else {
      addToast(t.cart.promoInvalidTitle, t.cart.promoInvalidMsg, 'error');
    }
  };

  const handleProceed = () => {
    setIsCartOpen(false);
    onOpenCheckout({
      promoCode: appliedPromo?.code || '',
      discountAmount
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d0f1b] border-l border-rose-500/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {t.cart.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {cart.length} {t.cart.selectedItems}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1"
                  title={language === 'en' ? 'Clear Cart' : 'Kosongkan Keranjang'}
                >
                  {language === 'en' ? 'Clear' : 'Kosongkan'}
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-base text-slate-200">
                  {t.cart.emptyTitle}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  {t.cart.emptyDesc}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-lg"
                >
                  {t.cart.exploreCatalog}
                </button>
              </div>
            ) : (
              cart.map(item => {
                const loc = getLocalizedProduct(item.product, language);
                return (
                <div
                  key={`${item.product.id}-${item.selectedSize || 'default'}`}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-3.5 items-center relative group"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={loc.name}
                    className="w-18 h-18 rounded-xl object-cover bg-slate-900 shrink-0 border border-white/10"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {getCategoryLabel(item.product.category, language)}
                      </span>
                      {item.selectedSize && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {t.cart.size} {item.selectedSize}
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-white truncate">
                      {loc.name}
                    </h5>

                    <div className="text-xs font-mono font-bold text-rose-400">
                      {formatIDR(item.product.price)}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-white/10 rounded-lg bg-black/40">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white text-xs"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-white min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-slate-400 hover:text-white text-xs disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title={language === 'en' ? 'Remove' : 'Hapus'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-white/[0.02] space-y-4">
              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    placeholder="Kode Promo (JKT48NEWERA / WOTA2026)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs uppercase font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  {t.cart.apply}
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs font-mono bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-rose-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t.cart.promoApplied} {appliedPromo.code}
                  </span>
                  <span>-{formatIDR(discountAmount)}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>{t.common.subtotal}</span>
                  <span className="font-mono text-slate-200">{formatIDR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>{t.common.discount}</span>
                    <span className="font-mono">-{formatIDR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.common.shipping}</span>
                  <span className="font-mono text-slate-400">
                    {language === 'en' ? 'Calculated at checkout' : 'Dihitung saat checkout'}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm text-white font-bold">
                  <span>{t.cart.estimatedTotal}</span>
                  <span className="font-display font-extrabold text-base text-rose-400">
                    {formatIDR(subtotal - discountAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>{t.cart.checkoutCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400">
                {t.cart.paymentSupports}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
