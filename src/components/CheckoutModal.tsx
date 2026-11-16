import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, generateInvoiceNumber, generateIntegrityChecksum } from '../utils/crypto';
import { STORE_CONFIG } from '../data/initialData';
import { PaymentMethod, Order } from '../types';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Wallet, 
  Building2, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  Copy,
  Download,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react';
import { QRISPaymentCard } from './QRISPaymentCard';
import { getCategoryLabel, getLocalizedProduct } from '../i18n/translations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode?: string;
  discountAmount?: number;
  onSuccessOrder: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  promoCode = '',
  discountAmount = 0,
  onSuccessOrder
}) => {
  const { cart, currentUser, checkoutOrder, addToast, language, t } = useStore();

  // Buyer Form State
  const [recipientName, setRecipientName] = useState(currentUser?.name || 'Reza Pratama');
  const [phone, setPhone] = useState(currentUser?.phone || '085712345678');
  const [email, setEmail] = useState(currentUser?.email || 'reza.pratama@gmail.com');
  const [address, setAddress] = useState(currentUser?.address || 'Jl. Raya Rohngawi Jawir timur kabupaten ngawiland');
  const [city, setCity] = useState('Kabupaten Ngawiland');
  const [postalCode, setPostalCode] = useState('63211');

  // Shipping Courier
  const couriers = [
    { id: 'JNE', name: language === 'en' ? 'JNE Express Theater (1-2 Days)' : 'JNE Express Teater (1-2 Hari)', cost: 20000 },
    { id: 'SICEPAT', name: language === 'en' ? 'SiCepat Priority JKT48 (1-3 Days)' : 'SiCepat Priority JKT48 (1-3 Hari)', cost: 18000 },
    { id: 'JNT', name: language === 'en' ? 'J&T Super Priority (2-3 Days)' : 'J&T Super Priority (2-3 Hari)', cost: 16000 },
    { id: 'SPECIAL_NGAWI', name: language === 'en' ? 'Ngawiland Theater Courier (Same Day)' : 'Kurir Teater Ngawiland (Sameday)', cost: 25000 },
  ];
  const [selectedCourier, setSelectedCourier] = useState(couriers[0]);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [qrisVerified, setQrisVerified] = useState(false);
  const [qrisRef] = useState(() => `QRJKT48${Date.now().toString().slice(-6)}`);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = 1000;
  const grandTotal = Math.max(0, subtotal + selectedCourier.cost + serviceFee - discountAmount);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!recipientName.trim() || !phone.trim() || !address.trim()) {
      const msg = t.checkout.requiredError;
      setFormError(msg);
      addToast(language === 'en' ? 'Incomplete Info' : 'Data Belum Lengkap', msg, 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        category: item.product.category,
        selectedSize: item.selectedSize
      }));

      const newOrder = await checkoutOrder({
        buyerName: recipientName.trim(),
        buyerEmail: email.trim(),
        shipping: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          courier: selectedCourier.name,
          shippingCost: selectedCourier.cost
        },
        items: orderItems,
        subtotal,
        shippingFee: selectedCourier.cost,
        discount: discountAmount,
        serviceFee,
        promoCode,
        total: grandTotal,
        paymentMethod
      });

      setCompletedOrder(newOrder);
      onSuccessOrder(newOrder);
    } catch (err: any) {
      const msg = err.message || t.checkout.checkoutError;
      setFormError(msg);
      addToast(t.checkout.checkoutError, msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-[#0d0f1c] border border-rose-500/30 shadow-[0_0_60px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                {completedOrder ? t.checkout.stepSuccessTitle : t.checkout.stepFormTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {completedOrder
                  ? `${language === 'en' ? 'Order ID' : 'Nomor Pesanan'}: ${completedOrder.id}`
                  : t.checkout.subtitleForm}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT: Order Success Receipt View OR Checkout Form */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Success Banner */}
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-lg text-white">
                  {t.checkout.verifiedBadgeTitle}
                </h4>
                <p className="text-xs text-slate-300">
                  {t.checkout.verifiedBadgeSub}
                </p>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">{t.checkout.invoiceNumber}</span>
                  <div className="font-mono font-bold text-sm text-rose-400">{completedOrder.id}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">{language === 'en' ? 'Tracking Number' : 'Nomor Resi Pelacakan'}</span>
                  <div className="font-mono font-bold text-sm text-cyan-400">{completedOrder.trackingNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">{t.checkout.paymentMethod}</span>
                  <div className="font-mono font-bold text-xs text-emerald-400">
                    {completedOrder.paymentMethod === 'QRIS'
                      ? (language === 'en' ? 'National QRIS (PAID · NMID ID1026048048480)' : 'QRIS Nasional (LUNAS · NMID ID1026048048480)')
                      : `${completedOrder.paymentMethod} (${language === 'en' ? 'PAID' : 'LUNAS'})`}
                  </div>
                </div>
              </div>

              {/* Items Purchased */}
              <div className="space-y-3">
                <h5 className="text-xs font-mono uppercase text-slate-400">{t.history.itemsPurchasedTitle}</h5>
                <div className="divide-y divide-white/5">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.quantity}x @ {formatIDR(item.price)} {item.selectedSize ? `(Size ${item.selectedSize})` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {formatIDR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping info */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-white">{t.history.buyerInfoTitle}:</div>
                <div>{t.checkout.recipient} <strong>{completedOrder.shipping.recipientName}</strong> ({completedOrder.shipping.phone})</div>
                <div>{language === 'en' ? 'Destination:' : 'Alamat Tujuan:'} {completedOrder.shipping.address}, {completedOrder.shipping.city} {completedOrder.shipping.postalCode}</div>
                <div className="text-red-300 font-mono text-[11px] pt-1">
                  {language === 'en' ? 'Dispatched from Official Store:' : 'Dikirim dari Toko Resmi:'} {STORE_CONFIG.address} • Hotline: {STORE_CONFIG.phone}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">{t.checkout.courier} {completedOrder.shipping.courier}</div>
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>{t.common.subtotal}:</span>
                  <span className="font-mono text-slate-200">{formatIDR(completedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.common.shipping}:</span>
                  <span className="font-mono text-slate-200">{formatIDR(completedOrder.shippingFee)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>{t.common.discount} ({completedOrder.promoCode}):</span>
                    <span className="font-mono">-{formatIDR(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.common.serviceFee}:</span>
                  <span className="font-mono text-slate-200">{formatIDR(completedOrder.serviceFee)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                  <span>{t.checkout.totalPaid}</span>
                  <span className="font-display font-extrabold text-lg text-rose-400">
                    {formatIDR(completedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-[10px] font-mono text-slate-400">
                <div className="text-rose-400 font-bold mb-0.5">{t.checkout.shaHash}:</div>
                <div className="break-all text-slate-300">{completedOrder.encryptedHash}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                {t.checkout.printReceipt}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg"
              >
                {t.checkout.done}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmOrder} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form & Courier */}
              <div className="lg:col-span-7 space-y-5">
                <h4 className="text-xs font-mono uppercase text-rose-400 font-bold tracking-wider">
                  {t.checkout.shippingTitle}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      {t.checkout.recipientName}
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder={t.checkout.recipientPlaceholder}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      {t.checkout.phone}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    {t.checkout.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    {t.checkout.fullAddress}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={t.checkout.addressPlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      {t.checkout.city}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                      {t.checkout.postalCode}
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Courier Selection */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-mono uppercase text-slate-300 block">
                    {t.checkout.courierLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {couriers.map(cr => (
                      <div
                        key={cr.id}
                        onClick={() => setSelectedCourier(cr)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedCourier.id === cr.id
                            ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-rose-400" />
                          <div>
                            <div className="text-xs font-bold text-white">{cr.name}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono font-bold text-rose-400">
                          {formatIDR(cr.cost)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-3 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-rose-400 font-bold tracking-wider">
                    {t.checkout.paymentTitle}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'QRIS'
                          ? 'border-rose-500 bg-rose-500/15 text-white shadow-[0_0_16px_rgba(244,63,94,0.2)]'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-rose-400" />
                      <span className="text-xs font-bold font-mono">QRIS</span>
                      <span className="text-[10px] text-slate-400 leading-none">{t.checkout.qrisSub}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('GOPAY')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'GOPAY'
                          ? 'border-cyan-500 bg-cyan-500/15 text-white'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Wallet className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-bold font-mono">GoPay / Dana</span>
                      <span className="text-[10px] text-slate-400 leading-none">{t.checkout.instantSub}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BCA_VA')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'BCA_VA'
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold font-mono">BCA VA</span>
                      <span className="text-[10px] text-slate-400 leading-none">{t.checkout.vaSub}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('MANDIRI_VA')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'MANDIRI_VA'
                          ? 'border-amber-500 bg-amber-500/15 text-white'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold font-mono">Mandiri VA</span>
                      <span className="text-[10px] text-slate-400 leading-none">{t.checkout.vaSub}</span>
                    </button>
                  </div>

                  {/* Interactive Local QRIS Panel */}
                  {paymentMethod === 'QRIS' && (
                    <QRISPaymentCard
                      amount={grandTotal}
                      merchantName="JKT48 OFFICIAL WEB SHOP"
                      referenceId={qrisRef}
                      isVerified={qrisVerified}
                      onVerifyPayment={() => {
                        setQrisVerified(true);
                        addToast(
                          language === 'en' ? 'QRIS Confirmed' : 'QRIS Terkonfirmasi',
                          language === 'en'
                            ? `QRIS payment of ${formatIDR(grandTotal)} is ready to complete.`
                            : `Pembayaran QRIS senilai ${formatIDR(grandTotal)} siap diselesaikan.`,
                          'success'
                        );
                      }}
                      onCopySuccess={(msg) => addToast('QRIS', msg, 'info')}
                    />
                  )}

                  {/* Instant GoPay / DANA Preview */}
                  {paymentMethod === 'GOPAY' && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-bold text-white">
                          {language === 'en' ? 'Instant GoPay / DANA Payment' : 'Pembayaran Instan GoPay / DANA'}
                        </div>
                        <p className="text-slate-400 mt-0.5">
                          {language === 'en' ? (
                            <>
                              Total bill <span className="font-mono font-bold text-cyan-300 tabular-nums">{formatIDR(grandTotal)}</span> will be forwarded to your e-wallet app after confirmation.
                            </>
                          ) : (
                            <>
                              Total tagihan <span className="font-mono font-bold text-cyan-300 tabular-nums">{formatIDR(grandTotal)}</span> akan diteruskan ke aplikasi e-wallet Anda setelah konfirmasi.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Virtual Account Preview */}
                  {(paymentMethod === 'BCA_VA' || paymentMethod === 'MANDIRI_VA') && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-400 font-mono">
                          {language === 'en' ? 'Virtual Account Number:' : 'Nomor Virtual Account:'}
                        </div>
                        <div className="font-mono font-bold text-base text-rose-400">
                          {paymentMethod === 'BCA_VA' ? '8804899210482019' : '8904811039827104'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(paymentMethod === 'BCA_VA' ? '8804899210482019' : '8904811039827104');
                          addToast(
                            t.qris.copied,
                            language === 'en' ? 'Virtual Account number copied to clipboard.' : 'Nomor Virtual Account disalin ke clipboard.',
                            'info'
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                        {language === 'en' ? 'Copy VA' : 'Salin VA'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Rincian Belanja Lengkap */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <h4 className="font-display font-bold text-sm text-white flex items-center justify-between">
                    <span>{t.checkout.summaryTitle}</span>
                    <span className="text-xs font-mono text-slate-400">{cart.length} {language === 'en' ? 'items' : 'item'}</span>
                  </h4>

                  {/* Product list */}
                  <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 divide-y divide-white/5">
                    {cart.map(item => {
                      const loc = getLocalizedProduct(item.product, language);
                      return (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="pt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.product.imageUrl}
                            alt={loc.name}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <div className="font-bold text-slate-200 truncate max-w-36">{loc.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.quantity}x • {item.selectedSize ? `Size ${item.selectedSize}` : getCategoryLabel(item.product.category, language)}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-300">
                          {formatIDR(item.product.price * item.quantity)}
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Breakdown Math */}
                  <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>{t.common.subtotal}:</span>
                      <span className="font-mono text-slate-200">{formatIDR(subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>{t.common.shipping} ({selectedCourier.name.split(' ')[0]}):</span>
                      <span className="font-mono text-slate-200">{formatIDR(selectedCourier.cost)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-rose-400 font-semibold">
                        <span>{t.common.discount} ({promoCode}):</span>
                        <span className="font-mono">-{formatIDR(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>{t.common.serviceFee}:</span>
                      <span className="font-mono text-slate-200">{formatIDR(serviceFee)}</span>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-white">
                      <span className="font-bold text-sm">{t.checkout.totalPay}:</span>
                      <span className="font-display font-extrabold text-xl text-rose-400">
                        {formatIDR(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Guarantee Box */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    {t.checkout.securityNote}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>{t.checkout.processing}</span>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'QRIS'
                          ? t.checkout.continueQris
                          : t.checkout.payNow}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
