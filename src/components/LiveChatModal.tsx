import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  TICKET_CATEGORIES, TicketCategory, TicketStatus
} from '../types';
import {
  getTicketCategoryText,
  getTicketStatusLabel,
  getOrderStatusLabel,
} from '../i18n/translations';
import {
  X, Send, PlusCircle, MessageSquare, ShieldCheck,
  Phone, Headset
} from 'lucide-react';

export const LiveChatModal: React.FC = () => {
  const {
    isLiveChatOpen,
    setIsLiveChatOpen,
    tickets,
    activeTicket,
    setActiveTicket,
    createTicket,
    sendTicketMessage,
    orders,
    currentUser,
    setIsWhatsAppGuideOpen,
    markTicketRead,
    language,
    t,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'new_ticket' | 'my_tickets'>('chat');

  // Form state for new ticket
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>('PENGIRIMAN');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message input state for active chat
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (activeTab === 'chat' && activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (activeTicket.id !== 'new') {
        markTicketRead(activeTicket.id);
      }
    }
  }, [activeTicket?.messages, activeTab, activeTicket?.id, markTicketRead]);

  // When activeTicket is initialized to 'new' from openChatWithOrder
  useEffect(() => {
    if (activeTicket && activeTicket.id === 'new') {
      setActiveTab('new_ticket');
      setSelectedCategory(activeTicket.category || 'PENGIRIMAN');
      setSubject(activeTicket.subject || '');
      setSelectedOrderId(activeTicket.orderId || '');
    } else if (activeTicket && activeTicket.id !== 'new') {
      setActiveTab('chat');
      markTicketRead(activeTicket.id);
    }
  }, [activeTicket, markTicketRead]);

  // If opening modal and no active ticket, but user has tickets, select first one
  useEffect(() => {
    if (isLiveChatOpen && !activeTicket && tickets.length > 0) {
      const userTickets = currentUser
        ? tickets.filter(tk => tk.userId === currentUser.id)
        : tickets;
      if (userTickets.length > 0) {
        setActiveTicket(userTickets[0]);
      } else {
        setActiveTab('new_ticket');
      }
    } else if (isLiveChatOpen && !activeTicket && tickets.length === 0) {
      setActiveTab('new_ticket');
    }
  }, [isLiveChatOpen, activeTicket, tickets, currentUser, setActiveTicket]);

  if (!isLiveChatOpen) return null;

  const userTickets = currentUser
    ? tickets.filter(tk => tk.userId === currentUser.id)
    : tickets.filter(tk => tk.userId === 'guest');

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const catText = getTicketCategoryText(selectedCategory, language);
      const newTicket = await createTicket({
        category: selectedCategory,
        categoryLabel: catText.label,
        subject: subject.trim(),
        message: initialMessage.trim(),
        orderId: selectedOrderId || undefined,
        priority: priority
      });

      setActiveTicket(newTicket);
      setActiveTab('chat');
      setSubject('');
      setInitialMessage('');
      setSelectedOrderId('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeTicket || activeTicket.id === 'new') return;

    const text = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    try {
      await sendTicketMessage(activeTicket.id, text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const label = getTicketStatusLabel(status, language);
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">{label}</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{label}</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{label}</span>;
      default:
        return null;
    }
  };

  const locale = language === 'en' ? 'en-US' : 'id-ID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-pink-950 via-slate-900 to-slate-900 border-b border-pink-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">{t.cs.title}</h3>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{t.cs.onlineBadge}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Official Support Center — JKT48 CyberMerch' : 'Pusat Layanan Bantuan Resmi JKT48 CyberMerch'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsWhatsAppGuideOpen(true)}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
              title={t.cs.waShortcut}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.cs.waShortcut}</span>
            </button>
            <button
              onClick={() => setIsLiveChatOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label={t.common.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation for User */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => {
              if (activeTicket && activeTicket.id !== 'new') {
                setActiveTab('chat');
              } else if (userTickets.length > 0) {
                setActiveTicket(userTickets[0]);
                setActiveTab('chat');
              } else {
                setActiveTab('new_ticket');
              }
            }}
            className={`pb-2 px-3 font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'chat' && activeTicket && activeTicket.id !== 'new'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {language === 'en' ? 'Active Chat' : 'Chat Aktif'}{' '}
              {activeTicket && activeTicket.id !== 'new' ? `(#${activeTicket.ticketNumber || activeTicket.id})` : ''}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new_ticket')}
            className={`pb-2 px-3 font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'new_ticket'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.cs.createTicketTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`pb-2 px-3 font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'my_tickets'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t.cs.myTicketsTab} ({userTickets.length})</span>
          </button>
        </div>

        {/* View 1: ACTIVE CHAT */}
        {activeTab === 'chat' && activeTicket && activeTicket.id !== 'new' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50">
            {/* Ticket Info Bar */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 overflow-hidden">
                <span className="font-mono font-bold text-pink-400 shrink-0">#{activeTicket.ticketNumber || activeTicket.id}</span>
                <span className="font-semibold text-slate-200 truncate">{activeTicket.subject}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {getTicketCategoryText(activeTicket.category, language).label || activeTicket.categoryLabel}
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {getStatusBadge(activeTicket.status)}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {/* Security info notice */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-pink-500/20 text-center text-xs text-slate-400">
                <p className="font-medium text-slate-300">
                  {language === 'en'
                    ? '🔒 This conversation is directly connected to Official JKT48 CyberMerch Customer Service.'
                    : '🔒 Percakapan ini terhubung langsung dengan Tim Customer Service Resmi JKT48 CyberMerch.'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'en'
                    ? 'Real-time message responses. Active support hours: 08:00 AM - 10:00 PM WIB.'
                    : 'Respon pesan bersifat real-time. Jam operasional aktif 08:00 - 22:00 WIB.'}
                </p>
              </div>

              {activeTicket.messages.map((msg) => {
                const isMe = msg.senderId === (currentUser?.id || 'guest');
                const isCs = msg.senderRole === 'admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className={`text-[11px] font-bold ${isCs ? 'text-pink-400' : 'text-slate-300'}`}>
                        {isCs ? `👑 ${t.cs.adminSender}` : msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-none'
                          : isCs
                          ? 'bg-slate-800 border border-pink-500/30 text-slate-100 rounded-tl-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t.cs.chatPlaceholder}
                  disabled={isSending || activeTicket.status === 'RESOLVED'}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending || activeTicket.status === 'RESOLVED'}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-pink-600/30 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.cs.sendMsg}</span>
                </button>
              </form>

              {activeTicket.status === 'RESOLVED' && (
                <p className="text-[11px] text-emerald-400 mt-2 text-center">
                  {t.cs.resolvedNote}
                </p>
              )}
            </div>
          </div>
        )}

        {/* View 2: FORM CREATE NEW TICKET */}
        {activeTab === 'new_ticket' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                {language === 'en' ? 'Create Customer Service Support Ticket' : 'Buat Tiket Bantuan Customer Service'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'en'
                  ? 'Pick your issue category so the JKT48 CyberMerch specialist team can help you quickly.'
                  : 'Pilih kategori keluhan Anda agar tim spesialis JKT48 CyberMerch dapat membantu secara spesifik dan cepat.'}
              </p>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {t.cs.selectCategory}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(TICKET_CATEGORIES) as TicketCategory[]).map((catKey) => {
                    const cat = getTicketCategoryText(catKey, language);
                    const isSelected = selectedCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedCategory(catKey)}
                        className={`text-left p-3 rounded-xl border transition ${
                          isSelected
                            ? 'bg-pink-950/60 border-pink-500 shadow-md shadow-pink-500/10'
                            : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${isSelected ? 'text-pink-400' : 'text-slate-200'}`}>
                            {cat.label}
                          </span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-pink-500"></span>}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Related Order (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {t.cs.orderIdLabel}
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">
                    {language === 'en' ? '-- Not linked to a specific order --' : '-- Tidak terkait pesanan tertentu --'}
                  </option>
                  {orders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {language === 'en' ? 'Order' : 'Pesanan'} #{ord.id} - Rp {ord.total.toLocaleString(locale)} ({getOrderStatusLabel(ord.orderStatus, language)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {t.cs.subjectLabel}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.cs.subjectPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Initial Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {t.cs.messageLabel}
                </label>
                <textarea
                  required
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder={t.cs.messagePlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                ></textarea>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {t.cs.priorityLabel}:
                </label>
                <div className="flex space-x-4">
                  {([
                    { key: 'NORMAL', label: t.cs.priorityNormal },
                    { key: 'HIGH', label: t.cs.priorityHigh },
                    { key: 'URGENT', label: t.cs.priorityUrgent },
                  ] as const).map((p) => (
                    <label key={p.key} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={p.key}
                        checked={priority === p.key}
                        onChange={() => setPriority(p.key)}
                        className="text-pink-600 focus:ring-pink-500"
                      />
                      <span className={`text-xs ${p.key === 'URGENT' ? 'text-red-400 font-bold' : p.key === 'HIGH' ? 'text-amber-400' : 'text-slate-300'}`}>
                        {p.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !initialMessage.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-600/30 transition disabled:opacity-50"
                >
                  {isSubmitting ? t.cs.submitting : t.cs.submitTicket}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View 3: MY TICKETS LIST */}
        {activeTab === 'my_tickets' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">{t.cs.myTicketsTab}</h4>
              <button
                onClick={() => setActiveTab('new_ticket')}
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.cs.createTicketTab}</span>
              </button>
            </div>

            {userTickets.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-slate-950 border border-slate-800">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-300">{t.cs.noTicketsTitle}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {t.cs.noTicketsDesc}
                </p>
                <button
                  onClick={() => setActiveTab('new_ticket')}
                  className="mt-4 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold"
                >
                  {t.cs.createFirstTicket}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userTickets.map((tk) => (
                  <div
                    key={tk.id}
                    onClick={() => {
                      setActiveTicket(tk);
                      setActiveTab('chat');
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      activeTicket?.id === tk.id
                        ? 'bg-pink-950/40 border-pink-500/60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-pink-400">#{tk.ticketNumber || tk.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {getTicketCategoryText(tk.category, language).label || tk.categoryLabel}
                        </span>
                      </div>
                      {getStatusBadge(tk.status)}
                    </div>

                    <h5 className="font-bold text-xs text-white truncate mb-1">{tk.subject}</h5>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{tk.messages.length} {language === 'en' ? 'Messages' : 'Pesan'}</span>
                      <span>{new Date(tk.updatedAt).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'en' ? 'Official WhatsApp Hotline:' : 'Hotline WhatsApp Resmi:'}{' '}
              <b className="text-white font-mono">62192807322</b>
            </span>
          </div>
          <button
            onClick={() => setIsWhatsAppGuideOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-[11px]"
          >
            {language === 'en' ? 'Open WhatsApp Guide →' : 'Buka Panduan WhatsApp →'}
          </button>
        </div>
      </div>
    </div>
  );
};

