import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { STORE_CONFIG } from '../data/initialData';
import { WhatsAppIcon } from './WhatsAppWidget';
import { UserAvatar } from './UserAvatar';
import { 
  ShoppingBag, 
  Bell, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  User as UserIcon, 
  LayoutDashboard, 
  Clock, 
  Sparkles,
  LogOut,
  ChevronDown,
  Layers,
  CheckCheck,
  Phone,
  MapPin,
  Calendar,
  Users,
  Camera,
  MessageSquare,
  MessageCircle,
  Headset,
  Globe
} from 'lucide-react';
import { formatDateID } from '../utils/crypto';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    cart,
    setIsCartOpen,
    activeView,
    setActiveView,
    setIsAuthModalOpen,
    setIsAvatarModalOpen,
    setAuthMode,
    logout,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    soundEnabled,
    toggleSound,
    setIsLiveChatOpen,
    setIsWhatsAppGuideOpen,
    unreadTicketsCount,
    language,
    setLanguage,
    t
  } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Official JKT48 Top Crimson Info Bar */}
      <div className="w-full bg-[#d92027] text-white py-1.5 px-4 text-[11px] sm:text-xs font-sans border-b border-red-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded font-mono font-bold tracking-wide whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {t.nav.officialBadge}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-red-200" />
              <span>{t.nav.storeAddressLabel} <strong>{STORE_CONFIG.address}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 shrink-0 text-red-200" />
              <span>{t.nav.hotlineLabel} <strong>{STORE_CONFIG.phone}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-red-100 text-[11px]">
            <span className="hidden md:inline whitespace-nowrap">{t.nav.encryptionNote}</span>
            {currentUser?.id === '1' && (
              <span className="bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow whitespace-nowrap">
                {t.nav.superadminActive}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main JKT48 Navigation Bar (White & Crisp Official Style) */}
      <div className="bg-[#12131c] text-white border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo - Official JKT48 Badge */}
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 group text-left transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#d92027] to-[#b91c1c] shadow-lg shadow-red-900/30 border-2 border-red-400/40 p-1">
              <div className="w-full h-full rounded-lg bg-white flex flex-col items-center justify-center">
                <span className="font-display font-black text-xs leading-none text-[#d92027] tracking-tighter">
                  JKT
                </span>
                <span className="font-display font-black text-sm leading-none text-[#d92027]">
                  48
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-white">
                  JKT48
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#d92027] text-white px-1.5 py-0.5 rounded tracking-wider uppercase">
                  OFFICIAL SHOP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                {t.nav.subBrand}
              </p>
            </div>
          </button>

          {/* Navigation Menu (jkt48.com style) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap shrink-0 ${
                activeView === 'home'
                  ? 'bg-[#d92027] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.nav.home}
            </button>

            <button
              onClick={() => setActiveView('catalog')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeView === 'catalog'
                  ? 'bg-[#d92027] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-400" />
              {t.nav.shop}
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeView === 'history'
                  ? 'bg-[#d92027] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-red-400" />
              {t.nav.history}
            </button>

            <button
              onClick={() => setActiveView('security')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeView === 'security'
                  ? 'bg-[#d92027] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.nav.warranty}
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeView === 'dashboard'
                    ? 'bg-amber-500 text-slate-900 shadow font-black'
                    : 'text-amber-300 hover:text-amber-200 bg-amber-500/15 border border-amber-500/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {t.nav.adminDashboard}
                {unreadNotifCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Switcher ID / EN */}
            <div
              className="flex items-center bg-white/5 border border-white/15 rounded-xl p-0.5 shrink-0"
              role="group"
              aria-label="Language Switcher"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 hidden sm:block shrink-0" />
              <button
                type="button"
                onClick={() => setLanguage('id')}
                title={t.common.switchToId}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                  language === 'id'
                    ? 'bg-[#d92027] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                title={t.common.switchToEn}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-[#d92027] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              aria-label="Toggle Sound"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10 shrink-0"
              title={soundEnabled ? t.nav.muteSfx : t.nav.enableSfx}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-red-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-white/10 shrink-0"
                aria-label={t.nav.viewNotifications}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold text-white bg-[#d92027] rounded-full border-2 border-[#12131c] shadow">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#161826] border border-red-500/20 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
                  <div className="p-3.5 px-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        {t.nav.notifTitle}
                      </span>
                      {unreadNotifCount > 0 && (
                        <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono font-bold">
                          {unreadNotifCount} {t.nav.newCount}
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {t.nav.markAllRead}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        {t.nav.noNotifications}
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.type === 'ORDER_CREATED' && currentUser?.role === 'admin') {
                              setActiveView('dashboard');
                              setIsNotifOpen(false);
                            }
                          }}
                          className={`p-3.5 px-4 transition-colors cursor-pointer flex gap-3 text-left ${
                            notif.read ? 'bg-transparent opacity-75 hover:bg-white/[0.02]' : 'bg-red-500/[0.08] hover:bg-red-500/[0.12]'
                          }`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'USER_REGISTERED' ? (
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                                👤
                              </div>
                            ) : notif.type === 'ORDER_CREATED' ? (
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                                🛒
                              </div>
                            ) : notif.type === 'ROLE_CHANGED' ? (
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                                👑
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center text-xs">
                                📢
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h6 className="text-xs font-semibold text-slate-200 truncate">
                                {notif.title}
                              </h6>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {formatDateID(notif.timestamp, language)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Contact Button */}
            <a
              href={STORE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 border border-[#25D366]/40 font-bold text-xs transition-all shadow-sm group"
              title={`Chat WhatsApp: ${STORE_CONFIG.phone}`}
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-slate-950 transition-colors" />
              <span className="font-mono">WA: {STORE_CONFIG.phone}</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#d92027] hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-950/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              aria-label={t.nav.cartAria}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-sans">{t.nav.cart}</span>
              <span className="bg-white text-[#d92027] px-1.5 py-0.2 rounded-full font-mono text-[11px] font-black">
                {totalCartCount}
              </span>
            </button>

            {/* User Account / Auth */}
            <div className="relative" ref={userRef}>
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                  >
                    <div className="relative">
                      <UserAvatar
                        src={currentUser.avatar}
                        name={currentUser.name}
                        username={currentUser.username}
                        isAdmin={currentUser.role === 'admin'}
                        className="w-8 h-8 rounded-lg border border-red-500/70"
                        textClassName="text-xs"
                      />
                      {unreadTicketsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#12131c] shadow-[0_0_6px_rgba(239,68,68,0.9)]" title={t.nav.csReplyTooltip} />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-white truncate max-w-28">
                        {currentUser.name}
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1 rounded ${
                        currentUser.id === '1'
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : currentUser.role === 'admin'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {currentUser.id === '1' ? 'ADMIN #1' : currentUser.role.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#161828] border border-white/10 shadow-2xl z-50 p-2 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-white truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            @{currentUser.username}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsAvatarModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-all"
                          title={t.nav.changePhotoTooltip}
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Change Profile Photo Button */}
                      <button
                        onClick={() => {
                          setIsAvatarModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-200 hover:text-white hover:bg-red-500/20 flex items-center gap-2 mb-1 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5 text-red-400" />
                        <span>{t.nav.changePhotoMenu}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('history');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5 text-red-400" />
                        {t.nav.txHistoryMenu}
                      </button>

                      <button
                        onClick={() => {
                          setIsLiveChatOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-pink-300 hover:text-white hover:bg-pink-950/40 flex items-center gap-2"
                      >
                        <Headset className="w-3.5 h-3.5 text-pink-400" />
                        <span>{t.nav.csMenu}</span>
                        {unreadTicketsCount > 0 && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsWhatsAppGuideOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-emerald-300 hover:text-white hover:bg-emerald-950/40 flex items-center gap-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.nav.waGuideMenu}</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveView('dashboard');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 font-bold"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                          {t.nav.adminMenu}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveView('security');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {t.nav.securityMenu}
                      </button>

                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {t.nav.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all whitespace-nowrap shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5 text-red-400" />
                  <span>{t.nav.loginRegister}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
