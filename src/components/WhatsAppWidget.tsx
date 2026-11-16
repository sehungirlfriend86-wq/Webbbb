import React from 'react';
import { STORE_CONFIG } from '../data/initialData';
import { useStore } from '../context/StoreContext';
import { Headset, Phone, X, ChevronRight, MessageCircle } from 'lucide-react';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.16 7.42C8.96 7.42 8.63 7.5 8.35 7.8C8.07 8.1 7.28 8.84 7.28 10.34C7.28 11.84 8.38 13.29 8.53 13.5C8.68 13.7 10.68 16.78 13.75 18.11C14.48 18.42 15.05 18.61 15.5 18.75C16.24 18.99 16.91 18.95 17.44 18.87C18.03 18.78 19.26 18.12 19.51 17.41C19.77 16.7 19.77 16.09 19.69 15.96C19.61 15.83 19.41 15.76 19.11 15.61C18.81 15.46 17.33 14.73 17.06 14.63C16.78 14.53 16.58 14.48 16.38 14.78C16.18 15.08 15.6 15.76 15.43 15.96C15.25 16.16 15.08 16.18 14.78 16.03C14.48 15.88 13.51 15.57 12.36 14.54C11.46 13.74 10.86 12.75 10.68 12.45C10.51 12.15 10.66 11.99 10.81 11.84C10.95 11.7 11.12 11.48 11.27 11.31C11.42 11.14 11.47 11.01 11.57 10.81C11.67 10.61 11.62 10.44 11.55 10.29C11.47 10.14 10.89 8.71 10.64 8.12C10.41 7.55 10.17 7.63 9.99 7.62C9.82 7.61 9.62 7.61 9.42 7.61C9.22 7.61 9.16 7.42 9.16 7.42Z" />
  </svg>
);

export const WhatsAppWidget: React.FC = () => {
  const { 
    setIsLiveChatOpen, 
    unreadTicketsCount, 
    csReplyPopup, 
    setCsReplyPopup, 
    tickets, 
    setActiveTicket, 
    markTicketRead,
    isLiveChatOpen,
    language,
    t
  } = useStore();

  const defaultPhone = STORE_CONFIG.phone || '62192807322';
  const waUrl = `https://wa.me/${defaultPhone}?text=Halo%20Admin%20Customer%20Service%20JKT48%20CyberMerch%2C%20saya%20ingin%20bertanya%20seputar%20pesanan%20dan%20merchandise%20resmi.`;

  const handleOpenRepliedTicket = () => {
    if (csReplyPopup) {
      const ticket = tickets.find(t => t.id === csReplyPopup.ticketId);
      if (ticket) {
        setActiveTicket(ticket);
        markTicketRead(ticket.id);
      }
    }
    setIsLiveChatOpen(true);
    setCsReplyPopup(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Mini-Popup Balasan CS (Muncul saat CS membalas, bisa ditutup/auto-close dan meninggalkan titik merah) */}
      {csReplyPopup && !isLiveChatOpen && (
        <div 
          className="w-72 sm:w-80 p-3.5 rounded-2xl bg-[#0f111e]/95 backdrop-blur-md border border-pink-500/50 shadow-2xl shadow-pink-950/60 animate-in slide-in-from-bottom-3 duration-200 text-xs relative"
          role="alert"
        >
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-pink-400 font-bold">
              <Headset className="w-4 h-4" />
              <span>{t.cs.popupTitle}</span>
            </div>
            <button
              onClick={() => setCsReplyPopup(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
              title={t.cs.popupDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 mb-2.5">
            <span className="text-[11px] font-semibold text-pink-300 block mb-0.5">
              {csReplyPopup.senderName}:
            </span>
            <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
              "{csReplyPopup.message}"
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              {language === 'en' ? 'Ticket' : 'Tiket'} #{csReplyPopup.ticketNumber || csReplyPopup.ticketId}
            </span>
            <button
              onClick={handleOpenRepliedTicket}
              className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-pink-600/30 transition"
            >
              <span>{t.cs.popupOpenChat}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Customer Service App Button with Titik Merah */}
      <button
        onClick={() => {
          setIsLiveChatOpen(true);
          setCsReplyPopup(null);
        }}
        className="relative group flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-pink-400/30 text-xs"
        title={t.cs.title}
      >
        <Headset className="w-4 h-4" />
        <span className="hidden sm:inline">Customer Service</span>
        
        {/* Titik Merah (Red Dot Indicator) agar tidak mengganggu */}
        {unreadTicketsCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#12131c] shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" 
            title={t.nav.csReplyTooltip}
          />
        )}
      </button>

      {/* Direct WhatsApp Button (Statis, tanpa kelap-kelip, langsung ke aplikasi WhatsApp) */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#18a84f] text-slate-950 font-bold shadow-xl hover:shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/30"
        title={`WhatsApp: ${defaultPhone}`}
        aria-label={`WhatsApp: ${defaultPhone}`}
      >
        <div className="relative">
          <WhatsAppIcon className="w-6 h-6 text-slate-950" />
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-xs font-black leading-tight text-slate-950">
            {language === 'en' ? 'WhatsApp Chat' : 'Chat WhatsApp'}
          </div>
          <div className="text-[10px] font-mono text-slate-800 font-bold">
            {defaultPhone}
          </div>
        </div>
      </a>
    </div>
  );
};
