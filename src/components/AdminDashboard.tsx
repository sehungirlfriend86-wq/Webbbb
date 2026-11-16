import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, formatDateID } from '../utils/crypto';
import { Order, User, TicketCategory, TICKET_CATEGORIES } from '../types';
import {
  getCategoryLabel,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getTicketCategoryText,
  getTicketStatusLabel,
  getLocalizedProduct,
} from '../i18n/translations';
import { UserAvatar } from './UserAvatar';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Bell,
  Package,
  Plus,
  DollarSign,
  Crown,
  UserCheck,
  UserX,
  FileText,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  TrendingUp,
  X,
  Printer,
  MapPin,
  Phone,
  Camera,
  MessageSquare,
  MessageCircle,
  Send,
  Filter,
  ExternalLink,
  Headset
} from 'lucide-react';
import { AddProductModal } from './AddProductModal';
import { STORE_CONFIG } from '../data/initialData';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    orders,
    products,
    notifications,
    tickets,
    sendTicketMessage,
    updateTicketStatus,
    unreadTicketsCount,
    updateUserRole,
    updateOrderStatus,
    deleteProduct,
    updateProduct,
    markNotificationRead,
    markAllNotificationsRead,
    refreshData,
    addToast,
    setIsAvatarModalOpen,
    setIsWhatsAppGuideOpen,
    language,
    t,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'inventory' | 'tickets'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  // Iframe-safe inline confirmations
  const [confirmRoleUserId, setConfirmRoleUserId] = useState<string | null>(null);
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(null);

  // Tickets & CS Chat state
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => tickets[0]?.id || null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  const locale = language === 'en' ? 'en-US' : 'id-ID';

  // Revenue metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
  const totalUsersCount = users.length;
  const isSuperAdmin = currentUser?.id === '1';

  // Role toggle by Superadmin ID 1
  const executeToggleRole = async (targetUser: User) => {
    if (!isSuperAdmin) {
      addToast(
        t.toasts.roleDeniedTitle,
        t.toasts.roleDeniedMsg,
        'error'
      );
      return;
    }

    if (targetUser.id === '1') {
      addToast(
        language === 'en' ? 'System Protection' : 'Proteksi Sistem',
        language === 'en' ? 'Master Superadmin ID "1" cannot be demoted.' : 'Akun Superadmin Utama ID "1" tidak dapat diturunkan.',
        'error'
      );
      return;
    }

    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(targetUser.id, nextRole);
      setConfirmRoleUserId(null);
    } catch {
      // handled in context
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch {
      // handled
    }
  };

  const handleSaveStock = async (prodId: string) => {
    try {
      await updateProduct(prodId, { stock: newStockVal });
      setEditingStockId(null);
    } catch {
      // handled
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Authority Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#0e101d] to-indigo-950/30 border border-rose-500/20 shadow-2xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-rose-400 font-bold">
              {t.admin.badge}
            </span>
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Crown className="w-3.5 h-3.5" />
                {t.admin.superadminBadge}
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full">
                ADMIN ACCESS
              </span>
            )}
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {t.admin.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.admin.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              <MapPin className="w-3 h-3 text-red-400" />
              <span>{t.footer.locationLabel} {STORE_CONFIG.address}</span>
            </span>
            <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-red-300 font-bold">
              <Phone className="w-3 h-3" />
              <span>Hotline: {STORE_CONFIG.phone}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title={language === 'en' ? 'Refresh Store Data' : 'Muat Ulang Data'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Sync Data' : 'Sinkronisasi Data'}</span>
          </button>

          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title={t.nav.changePhotoTooltip}
          >
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.history.changePhotoShort}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.admin.addProductBtn}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t.admin.statRevenue}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-emerald-400">
            {formatIDR(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>{language === 'en' ? 'Verified Paid (QRIS & VA)' : 'Terverifikasi Lunas (QRIS & VA)'}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t.admin.statOrders}</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-white">
            {orders.length} {language === 'en' ? 'Orders' : 'Pesanan'}
          </div>
          <div className="text-[11px] text-slate-500">
            {totalItemsSold} {language === 'en' ? 'Merchandise Units Sold' : 'Unit Merchandise Terjual'}
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{language === 'en' ? 'Registered Users' : 'Pengguna Terdaftar'}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-white">
            {totalUsersCount} {language === 'en' ? 'Accounts' : 'Akun'}
          </div>
          <div className="text-[11px] text-indigo-300 font-mono">
            {language === 'en' ? 'PBKDF2 Encrypted (SHA-256)' : 'Terenkripsi PBKDF2 (SHA-256)'}
          </div>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t.admin.statProducts}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-white">
            {products.length} SKU
          </div>
          <div className="text-[11px] text-amber-400">
            T-Shirt, Album, Photocard, Lightstick
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{t.admin.tabOverview}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.admin.tabOrders} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.admin.tabUsers}</span>
          {isSuperAdmin && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
              ID 1
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'inventory'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.admin.tabInventory} ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'tickets'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Headset className="w-4 h-4" />
          <span>{t.admin.tabTickets} ({tickets.length})</span>
          {unreadTicketsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white animate-pulse">
              {unreadTicketsCount} {language === 'en' ? 'New' : 'Baru'}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIVE NOTIFICATIONS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Real-Time Notifications Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-400" />
                <h3 className="font-display font-bold text-base text-white">
                  {t.admin.recentNotifs}
                </h3>
              </div>
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-slate-400 hover:text-rose-400 font-semibold transition-colors"
              >
                {t.admin.markAllRead}
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
                  {t.admin.noNotifs}
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      notif.read
                        ? 'bg-white/[0.02] border-white/5 text-slate-400'
                        : 'bg-rose-500/[0.06] border-rose-500/20 text-white shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-white/5 shrink-0 text-base">
                      {notif.type === 'USER_REGISTERED' ? '👤' : notif.type === 'ORDER_CREATED' ? '🛒' : notif.type === 'ROLE_CHANGED' ? '👑' : '⚡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {formatDateID(notif.timestamp, language)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.metadata?.amount && (
                        <div className="mt-2 text-xs font-mono font-bold text-rose-400">
                          {language === 'en' ? 'Amount:' : 'Nominal:'} {formatIDR(notif.metadata.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Quick Recent Orders Table */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>{language === 'en' ? 'Recent Transactions' : 'Transaksi Terbaru'}</span>
            </h3>

            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl glass-panel border border-white/5 hover:border-rose-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-400">{order.id}</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {getOrderStatusLabel(order.orderStatus, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{order.buyerName}</span>
                    <span className="font-mono font-bold text-white">{formatIDR(order.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-white/5">
                    <span>{order.paymentMethod}</span>
                    <button
                      onClick={() => setSelectedInvoice(order)}
                      className="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      {language === 'en' ? 'View Details →' : 'Buka Rincian →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {t.admin.ordersTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'en'
                  ? 'Update delivery statuses, inspect tracking numbers, and review full transaction invoices.'
                  : 'Ubah status pengiriman, kelola nomor resi, dan inspeksi rincian transaksi lengkap.'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">{t.admin.orderIdCol}</th>
                  <th className="p-4">{t.admin.buyerCol}</th>
                  <th className="p-4">{t.admin.itemsCol}</th>
                  <th className="p-4">{t.admin.totalCol}</th>
                  <th className="p-4">{t.admin.statusCol}</th>
                  <th className="p-4 text-right">{t.admin.actionCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-rose-400">{order.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{formatDateID(order.createdAt, language)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{order.buyerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.shipping.phone}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-40">{order.shipping.city}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">
                        {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                        {t.history.trackingLabel} {order.trackingNumber || (language === 'en' ? 'Not generated' : 'Belum di-generate')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-white text-sm">{formatIDR(order.total)}</div>
                      <div className="text-[10px] font-mono text-emerald-400 uppercase">
                        {order.paymentMethod} ({getPaymentStatusLabel(order.paymentStatus, language)})
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={e => handleUpdateStatus(order.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#141624] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                      >
                        <option value="DIPROSES">{getOrderStatusLabel('DIPROSES', language)}</option>
                        <option value="DIKIRIM">{getOrderStatusLabel('DIKIRIM', language)}</option>
                        <option value="SELESAI">{getOrderStatusLabel('SELESAI', language)}</option>
                        <option value="BATAL">{getOrderStatusLabel('BATAL', language)}</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t.admin.viewInvoice}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER & ADMIN ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  {t.admin.usersTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.admin.superadminNote}
              </p>
            </div>
          </div>

          {/* Superadmin Authority Alert Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300 uppercase tracking-wider font-mono">
                {language === 'en' ? 'Special Access Policy:' : 'Ketentuan Hak Akses Khusus:'}
              </span>
              <p className="text-slate-300 leading-relaxed">
                {t.admin.superadminNote}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">{t.admin.userCol}</th>
                  <th className="p-4">{t.admin.contactCol}</th>
                  <th className="p-4">{t.admin.roleCol}</th>
                  <th className="p-4">{language === 'en' ? 'Password Hash Encryption' : 'Enkripsi Password Hash'}</th>
                  <th className="p-4 text-right">{t.admin.actionCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${u.id === '1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/5 text-slate-400'}`}>
                        #{u.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative group">
                          <UserAvatar
                            src={u.avatar}
                            name={u.name}
                            username={u.username}
                            isAdmin={u.role === 'admin'}
                            className="w-8 h-8 rounded-lg border border-white/10"
                            textClassName="text-xs"
                          />
                          {u.id === currentUser?.id && (
                            <button
                              onClick={() => setIsAvatarModalOpen(true)}
                              className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                              title={t.nav.changePhotoTooltip}
                            >
                              <Camera className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id === '1' && (
                              <span title="Superadmin">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300">{u.email}</div>
                      <div className="text-[11px] font-mono text-slate-500">{u.phone || (language === 'en' ? 'Not set' : 'Belum diisi')}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-700/40 text-slate-300 border border-white/5'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      <span className="truncate max-w-32 block text-emerald-400/80">
                        {u.passwordHash ? `${u.passwordHash.substring(0, 16)}...` : 'PBKDF2 SHA-256'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.id === '1' ? (
                        <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {t.admin.protectedSuperadmin}
                        </span>
                      ) : isSuperAdmin ? (
                        confirmRoleUserId === u.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => executeToggleRole(u)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                            >
                              {language === 'en' ? 'Confirm' : 'Konfirmasi'}
                            </button>
                            <button
                              onClick={() => setConfirmRoleUserId(null)}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px]"
                            >
                              {t.common.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRoleUserId(u.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ml-auto transition-all ${
                              u.role === 'admin'
                                ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>{t.admin.demoteUser}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{t.admin.promoteAdmin}</span>
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {t.admin.onlyId1Note}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY & PRODUCTS MANAGER */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {t.admin.inventoryTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'en'
                  ? 'Add new merchandise via URL or Image Upload (PNG/JPG/JPEG), adjust stock and pricing.'
                  : 'Tambah merchandise baru via Link URL atau File (PNG/JPG/JPEG), sesuaikan stok dan harga.'}
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.addProductBtn}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(prod => {
              const loc = getLocalizedProduct(prod, language);
              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-rose-500/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={prod.imageUrl}
                      alt={loc.name}
                      className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                        {getCategoryLabel(prod.category, language)}
                      </span>
                      <h5 className="text-xs font-bold text-white line-clamp-2">
                        {loc.name}
                      </h5>
                      <div className="font-mono font-bold text-rose-400 text-xs">
                        {formatIDR(prod.price)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs gap-2">
                    {editingStockId === prod.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={newStockVal}
                          onChange={e => setNewStockVal(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-black border border-rose-500 text-xs text-white font-mono"
                        />
                        <button
                          onClick={() => handleSaveStock(prod.id)}
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold"
                        >
                          {t.common.save}
                        </button>
                        <button
                          onClick={() => setEditingStockId(null)}
                          className="text-slate-400 hover:text-white text-[11px]"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        {t.admin.stockCol}: <strong className="text-white">{prod.stock} {t.common.pcs}</strong>
                        <button
                          onClick={() => {
                            setEditingStockId(prod.id);
                            setNewStockVal(prod.stock);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title={language === 'en' ? 'Edit Stock' : 'Edit Stok'}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {confirmDeleteProdId === prod.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteProduct(prod.id);
                            setConfirmDeleteProdId(null);
                          }}
                          className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold"
                        >
                          {t.admin.deleteBtn}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteProdId(null)}
                          className="px-2 py-1 rounded bg-white/10 text-slate-300 text-[10px]"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteProdId(prod.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title={t.admin.deleteBtn}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CS TICKETS & LIVE SUPPORT CENTER */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900 border border-pink-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                  <Headset className="w-5 h-5" />
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-pink-400 font-bold">
                  Official Support & Helpdesk
                </span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                {t.admin.ticketsTitle}
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                {language === 'en'
                  ? 'Track ticket creators, respond to customer inquiries in real time, and connect directly via Official WhatsApp 62192807322.'
                  : 'Pantau siapa saja yang membuat tiket, tanggapi keluhan member JKT48 secara real-time, dan hubungkan langsung ke WhatsApp resmi 62192807322.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsWhatsAppGuideOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.nav.waGuideMenu}</span>
              </button>
              <button
                onClick={() => refreshData()}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Refresh Chat' : 'Segarkan Chat'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-slate-400 block mb-1">
                {language === 'en' ? 'Total Tickets:' : 'Total Semua Tiket:'}
              </span>
              <span className="font-display font-bold text-xl text-white">
                {tickets.length} {language === 'en' ? 'Tickets' : 'Tiket'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-300 block mb-1">
                {getTicketStatusLabel('OPEN', language)}:
              </span>
              <span className="font-display font-bold text-xl text-amber-400">
                {tickets.filter(tk => tk.status === 'OPEN').length} {language === 'en' ? 'Tickets' : 'Tiket'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-cyan-300 block mb-1">
                {getTicketStatusLabel('IN_PROGRESS', language)}:
              </span>
              <span className="font-display font-bold text-xl text-cyan-400">
                {tickets.filter(tk => tk.status === 'IN_PROGRESS').length} {language === 'en' ? 'Tickets' : 'Tiket'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-300 block mb-1">
                {getTicketStatusLabel('RESOLVED', language)}:
              </span>
              <span className="font-display font-bold text-xl text-emerald-400">
                {tickets.filter(tk => tk.status === 'RESOLVED').length} {language === 'en' ? 'Tickets' : 'Tiket'}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder={language === 'en' ? 'Search creator name, @username, subject, or ticket ID...' : 'Cari nama pembuat tiket, @username, subjek, atau ID tiket...'}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                <Filter className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-slate-400">{t.admin.categoryCol}:</span>
                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none"
                >
                  <option value="ALL" className="bg-slate-900 text-white">{t.admin.allCategories} ({tickets.length})</option>
                  {(Object.keys(TICKET_CATEGORIES) as TicketCategory[]).map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {getTicketCategoryText(cat, language).label} ({tickets.filter(tk => tk.category === cat).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400">Status:</span>
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none"
                >
                  <option value="ALL" className="bg-slate-900 text-white">{t.admin.allStatuses}</option>
                  <option value="OPEN" className="bg-slate-900 text-amber-300">{getTicketStatusLabel('OPEN', language)}</option>
                  <option value="IN_PROGRESS" className="bg-slate-900 text-cyan-300">{getTicketStatusLabel('IN_PROGRESS', language)}</option>
                  <option value="RESOLVED" className="bg-slate-900 text-emerald-300">{getTicketStatusLabel('RESOLVED', language)}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Ticket List & Live Chat Box */}
          {(() => {
            const filteredTickets = tickets.filter(tk => {
              const matchCat = ticketCategoryFilter === 'ALL' || tk.category === ticketCategoryFilter;
              const matchStatus = ticketStatusFilter === 'ALL' || tk.status === ticketStatusFilter;
              const query = ticketSearch.toLowerCase();
              const matchSearch = !query ||
                tk.userName.toLowerCase().includes(query) ||
                tk.userUsername.toLowerCase().includes(query) ||
                tk.subject.toLowerCase().includes(query) ||
                tk.id.toLowerCase().includes(query) ||
                (tk.ticketNumber && tk.ticketNumber.toLowerCase().includes(query));
              return matchCat && matchStatus && matchSearch;
            });

            const activeSelectedTicket = tickets.find(tk => tk.id === selectedTicketId) || filteredTickets[0] || null;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                {/* LEFT: List of Tickets and WHO CREATED THEM */}
                <div className="lg:col-span-5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-slate-300 uppercase tracking-wider">
                      {language === 'en' ? `Ticket Creators (${filteredTickets.length})` : `Daftar Pembuat Tiket (${filteredTickets.length})`}
                    </span>
                    <span className="text-slate-500">
                      {language === 'en' ? 'Click ticket to reply' : 'Klik tiket untuk membalas'}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                    {filteredTickets.length === 0 ? (
                      <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/10 text-slate-400">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="font-bold text-sm text-slate-300">{t.admin.noTicketsAdmin}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {language === 'en' ? 'Try adjusting your search keywords or status filters.' : 'Coba sesuaikan kata kunci pencarian atau filter status.'}
                        </p>
                      </div>
                    ) : (
                      filteredTickets.map(tk => {
                        const isSelected = activeSelectedTicket?.id === tk.id;
                        const hasUnreadUserMsg = tk.messages.some(m => m.senderRole === 'user' && !m.read);

                        return (
                          <div
                            key={tk.id}
                            onClick={() => setSelectedTicketId(tk.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'bg-pink-950/40 border-pink-500/70 shadow-lg shadow-pink-900/20'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            {/* Unread dot */}
                            {hasUnreadUserMsg && (
                              <span
                                className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse ring-4 ring-pink-500/20"
                                title={language === 'en' ? 'New customer message' : 'Ada pesan baru dari user'}
                              />
                            )}

                            {/* Header: Ticket Number, Category & Status */}
                            <div className="flex items-center justify-between gap-2 mb-2 pr-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-xs font-bold text-pink-400">
                                  #{tk.ticketNumber || tk.id}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                  {getTicketCategoryText(tk.category, language).label || tk.categoryLabel}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                tk.status === 'OPEN'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : tk.status === 'IN_PROGRESS'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {getTicketStatusLabel(tk.status, language)}
                              </span>
                            </div>

                            {/* Subject */}
                            <h4 className="text-xs font-bold text-white mb-2 line-clamp-1">
                              {tk.subject}
                            </h4>

                            {/* WHO CREATED THE TICKET */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  src={tk.userAvatar}
                                  name={tk.userName}
                                  username={tk.userUsername}
                                  className="w-7 h-7 rounded-full border border-pink-500/40"
                                  textClassName="text-[10px]"
                                />
                                <div>
                                  <span className="font-semibold text-slate-200 block text-[11px] leading-tight">
                                    {tk.userName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    @{tk.userUsername}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block">
                                  {new Date(tk.updatedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} WIB
                                </span>
                                <span className="text-[10px] text-pink-400/80 font-mono">
                                  {tk.messages.length} {language === 'en' ? 'msgs' : 'pesan'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT: Live Chat Box for Selected Ticket */}
                <div className="lg:col-span-7 flex flex-col rounded-3xl bg-[#0f111f] border border-white/10 overflow-hidden shadow-2xl h-[620px]">
                  {activeSelectedTicket ? (
                    <>
                      {/* Ticket Detail Bar & Who Created Detail */}
                      <div className="p-4 bg-white/[0.03] border-b border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-pink-400">
                                #{activeSelectedTicket.ticketNumber || activeSelectedTicket.id}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                {getTicketCategoryText(activeSelectedTicket.category, language).label || activeSelectedTicket.categoryLabel}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">
                              {activeSelectedTicket.subject}
                            </h4>
                          </div>

                          {/* Status changer buttons */}
                          <div className="flex items-center gap-1.5 self-start sm:self-auto">
                            <button
                              onClick={() => updateTicketStatus(activeSelectedTicket.id, 'IN_PROGRESS')}
                              disabled={activeSelectedTicket.status === 'IN_PROGRESS'}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold disabled:opacity-40 transition"
                            >
                              {t.admin.markInProgress}
                            </button>
                            <button
                              onClick={() => updateTicketStatus(activeSelectedTicket.id, 'RESOLVED')}
                              disabled={activeSelectedTicket.status === 'RESOLVED'}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold disabled:opacity-40 transition"
                            >
                              {t.admin.markResolved}
                            </button>
                          </div>
                        </div>

                        {/* User Creator Details Strip */}
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              src={activeSelectedTicket.userAvatar}
                              name={activeSelectedTicket.userName}
                              username={activeSelectedTicket.userUsername}
                              className="w-9 h-9 rounded-full border border-pink-500/50"
                              textClassName="text-xs"
                            />
                            <div>
                              <div className="font-bold text-slate-200">
                                {activeSelectedTicket.userName} <span className="text-slate-400 font-mono text-[11px]">(@{activeSelectedTicket.userUsername})</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                                {activeSelectedTicket.userEmail && <span>📧 {activeSelectedTicket.userEmail}</span>}
                                {activeSelectedTicket.userPhone && <span>📱 {activeSelectedTicket.userPhone}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {activeSelectedTicket.userPhone && (
                              <a
                                href={`https://wa.me/${activeSelectedTicket.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  language === 'en'
                                    ? `Hello ${activeSelectedTicket.userName}, Official JKT48 CyberMerch Customer Service is responding to ticket #${activeSelectedTicket.ticketNumber || activeSelectedTicket.id}`
                                    : `Halo ${activeSelectedTicket.userName}, kami dari Tim Customer Service JKT48 CyberMerch merespon tiket bantuan #${activeSelectedTicket.ticketNumber || activeSelectedTicket.id}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp User</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {activeSelectedTicket.orderId && (
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono">
                                Order #{activeSelectedTicket.orderId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages Log */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0c16]/50">
                        {activeSelectedTicket.messages.map((msg) => {
                          const isCs = msg.senderRole === 'admin';

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isCs ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center space-x-1.5 mb-1 px-1">
                                <span className={`text-[11px] font-bold ${isCs ? 'text-pink-400' : 'text-slate-300'}`}>
                                  {isCs ? `👑 ${t.cs.adminSender} (${t.cs.youLabel})` : `👤 ${msg.senderName}`}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(msg.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                                  isCs
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 border border-white/10 text-slate-100 rounded-tl-none'
                                }`}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Reply Presets */}
                      <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px]">
                        <span className="text-slate-500 font-bold shrink-0">{t.admin.quickReplyLabel}</span>
                        {t.admin.quickReplies.map((replyText, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReplyMessage(replyText)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 shrink-0 border border-white/5 truncate max-w-[180px]"
                            title={replyText}
                          >
                            {replyText.slice(0, 28)}...
                          </button>
                        ))}
                      </div>

                      {/* Message Input Box */}
                      <div className="p-3 bg-black/70 border-t border-white/10">
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!replyMessage.trim() || isSendingReply) return;
                            const text = replyMessage.trim();
                            setReplyMessage('');
                            setIsSendingReply(true);
                            try {
                              await sendTicketMessage(activeSelectedTicket.id, text);
                            } finally {
                              setIsSendingReply(false);
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder={`${t.admin.adminReplyPlaceholder} (@${activeSelectedTicket.userUsername})`}
                            disabled={isSendingReply}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                          />
                          <button
                            type="submit"
                            disabled={!replyMessage.trim() || isSendingReply}
                            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.admin.sendReplyBtn}</span>
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
                      <h4 className="text-base font-bold text-slate-300">
                        {language === 'en' ? 'Select a Support Ticket' : 'Pilih Tiket Bantuan'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        {t.admin.selectTicketPrompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-[#0f111f] border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {language === 'en' ? `Order Details #${selectedInvoice.id}` : `Rincian Pembelian #${selectedInvoice.id}`}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    {t.history.buyerLabel} {selectedInvoice.buyerName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                aria-label={t.common.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">{language === 'en' ? 'DATE' : 'WAKTU'}</span>
                  <span className="font-semibold text-white">{formatDateID(selectedInvoice.createdAt, language)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">{language === 'en' ? 'PAYMENT METHOD' : 'METODE BAYAR'}</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedInvoice.paymentMethod} ({getPaymentStatusLabel(selectedInvoice.paymentStatus, language)})
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="font-mono text-slate-400 uppercase text-[10px] block">{t.history.itemsPurchasedTitle}</span>
                <div className="divide-y divide-white/5 border border-white/10 rounded-xl p-2 bg-black/30">
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={it.imageUrl} alt={it.name} className="w-9 h-9 rounded object-cover" />
                        <div>
                          <div className="font-bold text-white">{it.name}</div>
                          <div className="text-[10px] text-slate-400">{it.quantity}x @ {formatIDR(it.price)}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-200">{formatIDR(it.price * it.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping info */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white">{t.checkout.fullAddress.replace(' *', ':')}</div>
                <div>{selectedInvoice.shipping.recipientName} ({selectedInvoice.shipping.phone})</div>
                <div>{selectedInvoice.shipping.address}, {selectedInvoice.shipping.city} {selectedInvoice.shipping.postalCode}</div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {t.checkout.courier} {selectedInvoice.shipping.courier} | {t.history.trackingLabel} {selectedInvoice.trackingNumber}
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>{t.common.subtotal}:</span>
                  <span className="font-mono text-white">{formatIDR(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.common.shipping}:</span>
                  <span className="font-mono text-white">{formatIDR(selectedInvoice.shippingFee)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>{t.common.discount}:</span>
                    <span className="font-mono">-{formatIDR(selectedInvoice.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
                  <span>{t.common.total}:</span>
                  <span className="text-rose-400 font-display text-base">{formatIDR(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-white/10 flex justify-end gap-2 bg-white/[0.02]">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.history.invoicePrint}</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

