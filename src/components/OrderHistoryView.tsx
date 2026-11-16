import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { formatIDR, formatDateID } from '../utils/crypto';
import { STORE_CONFIG } from '../data/initialData';
import { UserAvatar } from './UserAvatar';
import { getOrderStatusLabel } from '../i18n/translations';
import { 
  Clock, 
  Search, 
  ChevronRight, 
  Truck, 
  FileText, 
  ShieldCheck, 
  X, 
  Printer, 
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Camera,
  MessageSquare,
  MessageCircle,
  Phone,
  ExternalLink,
  HelpCircle,
  MapPin,
  Mail,
  User as UserIcon,
  Sparkles,
  Headset
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const { 
    orders, 
    currentUser, 
    setActiveView, 
    setIsAvatarModalOpen, 
    setIsWhatsAppGuideOpen,
    openChatWithOrder,
    setIsLiveChatOpen,
    setIsAuthModalOpen,
    language,
    t
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // If user is regular member, show their orders; if admin, show all orders
  const displayOrders = currentUser?.role === 'admin' 
    ? orders 
    : orders.filter(o => o.userId === currentUser?.id || o.buyerEmail === currentUser?.email || o.buyerUsername === currentUser?.username);

  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSpent = displayOrders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);

  const getStatusBadge = (status: OrderStatus) => {
    const label = getOrderStatusLabel(status, language);
    switch (status) {
      case 'DIPROSES':
        return { label, bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'DIKIRIM':
        return { label, bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'SELESAI':
        return { label, bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'BATAL':
        return { label, bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      default:
        return { label, bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. USER ACCOUNT & PROFILE CARD (Fitur untuk SEMUA User: Baru & Lama) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-[#0d0f1c] to-purple-950/30 border border-pink-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <UserAvatar
                src={currentUser?.avatar}
                name={currentUser?.name || 'Tamu JKT48'}
                username={currentUser?.username || 'tamu'}
                isAdmin={currentUser?.role === 'admin'}
                className="w-20 h-20 rounded-2xl border-2 border-pink-500 shadow-lg shadow-pink-500/30 group-hover:scale-105 transition duration-200"
                textClassName="text-2xl"
              />
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsAvatarModalOpen(true);
                  }
                }}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition duration-200"
                title={t.nav.changePhotoTooltip}
              >
                <Camera className="w-5 h-5 mb-0.5 text-pink-400" />
                <span>{language === 'en' ? 'Change Photo' : 'Ubah Foto'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  {currentUser ? currentUser.name : (language === 'en' ? 'JKT48 Guest Visitor' : 'Tamu Pengunjung JKT48')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
                  {currentUser ? (currentUser.role === 'admin' ? 'Super Admin' : 'Official Member Wota') : 'Guest'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                @{currentUser ? currentUser.username : 'guest'} • {currentUser?.email || (language === 'en' ? 'Not signed in yet' : 'Belum masuk ke akun')}
              </p>
              {currentUser?.address && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span>{currentUser.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Profile Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsAvatarModalOpen(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-600/30 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{t.history.changePhotoBtn}</span>
            </button>

            <button
              onClick={() => setIsLiveChatOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 transition"
            >
              <Headset className="w-4 h-4 text-pink-400" />
              <span>{t.history.csOnlineBtn}</span>
            </button>

            <button
              onClick={() => setIsWhatsAppGuideOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>{t.history.waGuideBtn} (62192807322)</span>
            </button>
          </div>
        </div>

        {/* User stats summary */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">{t.history.totalSpendLabel}:</span>
            <span className="font-display font-extrabold text-base text-rose-400">{formatIDR(totalSpent)}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">{t.history.totalOrdersLabel}:</span>
            <span className="font-display font-extrabold text-base text-white">
              {displayOrders.length} {language === 'en' ? 'Orders' : 'Pesanan'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">{language === 'en' ? 'Account Status:' : 'Status Akun:'}</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'en' ? 'Active & Verified' : 'Terverifikasi Aktif'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">{language === 'en' ? 'Dispatch Warehouse:' : 'Alamat Gudang Pengiriman:'}</span>
            <span className="text-slate-300 truncate block">{STORE_CONFIG.address}</span>
          </div>
        </div>
      </div>

      {/* 2. WHATSAPP & CUSTOMER SERVICE DIRECT HOTLINE BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white">{t.history.waBannerTitle}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.history.waBannerDesc} (<b className="text-white font-mono">62192807322</b>)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsWhatsAppGuideOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {language === 'en' ? 'View Guide & Templates' : 'Lihat Panduan & Template'}
          </button>
          <a
            href="https://wa.me/62192807322?text=Halo%20Customer%20Service%20JKT48%20CyberMerch!%20Saya%20ingin%20menanyakan%20seputar%20pesanan%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === 'en' ? 'Chat WA Now' : 'Chat WA Sekarang'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3. ORDER HISTORY SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>{language === 'en' ? 'Customer Transaction Log' : 'Riwayat Transaksi Pelanggan'}</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl text-white">
            {t.history.sectionTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t.history.sectionSubtitle
              .replace('{count}', String(filteredOrders.length))
              .replace(
                '{scope}',
                currentUser?.role === 'admin'
                  ? t.history.scopeAdmin
                  : currentUser
                  ? t.history.scopeMember.replace('{username}', currentUser.username)
                  : t.history.scopeGuest
              )}
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
            <span>{language === 'en' ? 'Admin Mode: Showing all store orders' : 'Mode Admin: Menampilkan seluruh pesanan sistem'}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'DIPROSES', 'DIKIRIM', 'SELESAI'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {st === 'ALL' ? t.history.allStatus : getOrderStatusLabel(st, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-600 border border-white/10">
            <Clock className="w-8 h-8" />
          </div>
          <h4 className="font-display font-bold text-base text-slate-200">
            {t.history.emptyOrdersTitle}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' ? t.history.emptyFilterDesc : t.history.emptyOrdersDesc}
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
          >
            {t.history.goShopBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.orderStatus);
            return (
              <div
                key={order.id}
                className="rounded-2xl glass-panel p-5 border border-white/10 hover:border-pink-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                      {order.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      • {formatDateID(order.createdAt, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.items.slice(0, 3).map((it, idx) => (
                        <img
                          key={idx}
                          src={it.imageUrl}
                          alt={it.name}
                          className="inline-block h-9 w-9 rounded-lg ring-2 ring-[#0d0f1c] object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {t.checkout.recipient} {order.shipping.recipientName} ({order.shipping.city}) • {t.checkout.courier} {order.shipping.courier}
                        {order.trackingNumber && ` • ${t.history.trackingLabel} ${order.trackingNumber}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Info & Actions */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <div className="text-left lg:text-right mr-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      {t.history.totalPayLabel} ({order.paymentMethod})
                    </span>
                    <span className="font-display font-extrabold text-base sm:text-lg text-rose-400">
                      {formatIDR(order.total)}
                    </span>
                  </div>

                  {/* Ask CS / Create Ticket for this specific order */}
                  <button
                    onClick={() => openChatWithOrder(order.id, order.items[0]?.name)}
                    className="px-3.5 py-2 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 border border-pink-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                    title={t.history.askOrderBtn}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.history.askOrderBtn}</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t.history.detailInvoiceBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED INVOICE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div 
            className="relative w-full max-w-2xl rounded-3xl bg-[#0f111f] border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {t.history.invoiceTitle}
                  </h3>
                  <div className="text-xs font-mono text-rose-400">{selectedOrder.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Top Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div>
                  <span className="text-slate-400 block mb-0.5">{language === 'en' ? 'Transaction Date:' : 'Waktu Transaksi:'}</span>
                  <span className="font-mono text-white">{formatDateID(selectedOrder.createdAt, language)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">{language === 'en' ? 'Order Status:' : 'Status Pesanan:'}</span>
                  <span className="font-mono font-bold text-rose-400 uppercase">{getOrderStatusLabel(selectedOrder.orderStatus, language)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">{t.checkout.paymentMethod}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedOrder.paymentMethod === 'QRIS'
                      ? (language === 'en' ? 'QRIS (PAID · NMID ID1026048048480)' : 'QRIS (LUNAS · NMID ID1026048048480)')
                      : `${selectedOrder.paymentMethod} (${language === 'en' ? 'PAID' : 'LUNAS'})`}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  {t.history.itemsPurchasedTitle} ({selectedOrder.items.length}):
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{item.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            {item.quantity} x {formatIDR(item.price)}
                            {item.selectedSize && ` • Ukuran: ${item.selectedSize}`}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-rose-400 text-xs">
                        {formatIDR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs mb-1">
                  <Truck className="w-4 h-4 text-rose-400" />
                  <span>{t.history.buyerInfoTitle}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">{t.checkout.recipient}</span>
                    <span className="font-bold">{selectedOrder.shipping.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.checkout.phone}</span>
                    <span className="font-mono">{selectedOrder.shipping.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">{language === 'en' ? 'Destination Address:' : 'Alamat Tujuan:'}</span>
                    <span>{selectedOrder.shipping.address}, {selectedOrder.shipping.city}, {selectedOrder.shipping.province} {selectedOrder.shipping.postalCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.checkout.courier}</span>
                    <span className="font-mono font-bold text-rose-400">{selectedOrder.shipping.courier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.history.trackingLabel}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedOrder.trackingNumber || (language === 'en' ? 'Processing' : 'Sedang Diproses')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>{t.common.subtotal}:</span>
                  <span className="font-mono text-slate-200">{formatIDR(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.common.shipping} ({selectedOrder.shipping.courier}):</span>
                  <span className="font-mono text-slate-200">{formatIDR(selectedOrder.shippingFee)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>{t.common.discount} ({selectedOrder.promoCode}):</span>
                    <span className="font-mono">-{formatIDR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.common.serviceFee}:</span>
                  <span className="font-mono text-slate-200">{formatIDR(selectedOrder.serviceFee)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>{t.checkout.totalPaid} ({selectedOrder.paymentMethod}):</span>
                  <span className="font-display font-extrabold text-base text-rose-400">
                    {formatIDR(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Direct CS Contact for this order */}
              <div className="p-3.5 rounded-xl bg-pink-950/30 border border-pink-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  <span className="text-slate-200 font-medium">
                    {language === 'en' ? 'Need help with this order?' : 'Ada pertanyaan untuk pesanan ini?'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const ordId = selectedOrder.id;
                    setSelectedOrder(null);
                    openChatWithOrder(ordId, selectedOrder.items[0]?.name);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs"
                >
                  {language === 'en' ? 'Open CS Ticket' : 'Buka Tiket CS'}
                </button>
              </div>

              {/* Security Hash Proof */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-[10px] font-mono text-slate-400">
                <div className="text-rose-400 font-bold mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.history.verifyHashTitle}:</span>
                </div>
                <div className="break-all text-slate-300">{selectedOrder.encryptedHash}</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                {t.history.invoicePrint}
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {t.history.invoiceClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
