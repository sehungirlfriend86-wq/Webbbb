import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, User, Order, AdminNotification, CartItem, UserRole, SupportTicket, TicketMessage, TicketCategory, TicketStatus } from '../types';
import { api } from '../api/client';
import { sfx } from '../utils/sound';
import { Language, TranslationDict, translations } from '../i18n/translations';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'cyber';
}

export interface CSReplyPopupData {
  ticketId: string;
  ticketNumber?: string;
  senderName: string;
  message: string;
  ticketSubject: string;
}

interface StoreContextType {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (username: string, pass: string) => Promise<void>;
  register: (data: {
    username: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUserRole: (targetUserId: string, newRole: UserRole) => Promise<void>;
  updateUserAvatar: (newAvatarUrl: string) => Promise<void>;
  isAvatarModalOpen: boolean;
  setIsAvatarModalOpen: (open: boolean) => void;

  // Support Tickets & Live Chat
  tickets: SupportTicket[];
  activeTicket: SupportTicket | null;
  setActiveTicket: (ticket: SupportTicket | null) => void;
  createTicket: (data: {
    category: TicketCategory;
    categoryLabel: string;
    subject: string;
    message: string;
    orderId?: string;
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  }) => Promise<SupportTicket>;
  sendTicketMessage: (ticketId: string, message: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  isLiveChatOpen: boolean;
  setIsLiveChatOpen: (open: boolean) => void;
  openChatWithOrder: (orderId: string, orderSummary?: string) => void;
  unreadTicketsCount: number;
  markTicketRead: (ticketId: string) => void;
  csReplyPopup: CSReplyPopupData | null;
  setCsReplyPopup: (popup: CSReplyPopupData | null) => void;
  isWhatsAppGuideOpen: boolean;
  setIsWhatsAppGuideOpen: (open: boolean) => void;

  // Products
  products: Product[];
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  checkoutOrder: (orderPayload: any) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: string, trackingNumber?: string) => Promise<void>;

  // Admin Notifications
  notifications: AdminNotification[];
  unreadNotifCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Navigation & UI state
  activeView: 'home' | 'catalog' | 'history' | 'dashboard' | 'security';
  setActiveView: (view: 'home' | 'catalog' | 'history' | 'dashboard' | 'security') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDict;

  // Sound effects
  soundEnabled: boolean;
  toggleSound: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'cyber') => void;
  removeToast: (id: string) => void;

  // Data reload
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('jkt48_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isWhatsAppGuideOpen, setIsWhatsAppGuideOpen] = useState(false);
  const [csReplyPopup, setCsReplyPopup] = useState<CSReplyPopupData | null>(null);

  // Auto dismiss CS reply popup after 9 seconds, leaving the red dot indicator
  useEffect(() => {
    if (!csReplyPopup) return;
    const timer = setTimeout(() => {
      setCsReplyPopup(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [csReplyPopup]);

  const [activeView, setActiveView] = useState<'home' | 'catalog' | 'history' | 'dashboard' | 'security'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'id';
    try {
      const saved = localStorage.getItem('jkt48_language');
      return saved === 'en' ? 'en' : 'id';
    } catch {
      return 'id';
    }
  });

  const t = translations[language];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('jkt48_language', language);
    } catch {
      // ignore
    }
    document.documentElement.lang = language;
    document.title =
      language === 'en'
        ? 'JKT48 Official Web Shop - Official Merchandise Store'
        : 'JKT48 Official Web Shop - Toko Merchandise Resmi';
  }, [language]);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('jkt48_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'cyber' = 'cyber') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
    if (next) sfx.playClick();
  };

  const setLanguage = useCallback((lang: Language) => {
    sfx.playClick();
    setLanguageState(lang);
    const dict = translations[lang];
    addToast(dict.toasts.langChangedTitle, dict.toasts.langChangedMsg, 'info');
  }, [addToast]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'id' ? 'en' : 'id');
  }, [language, setLanguage]);

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const [prods, notifs, ords, uList, tList] = await Promise.all([
        api.getProducts(),
        api.getNotifications(),
        api.getOrders(),
        api.getUsers(),
        api.getTickets(currentUser?.id, currentUser?.role)
      ]);
      setProducts(prods);
      setNotifications(notifs);
      setOrders(ords);
      setUsers(uList);
      setTickets(tList);
      if (activeTicket) {
        const found = tList.find(t => t.id === activeTicket.id);
        if (found) setActiveTicket(found);
      }
    } catch (err) {
      console.error('Error refreshing store data:', err);
    }
  }, [currentUser?.id, currentUser?.role, activeTicket?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // WebSocket for Real-time Live Chat & Tickets
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let socket: WebSocket | null = null;
    let pingTimer: any = null;
    let reconnectTimer: any = null;
    let isDisposed = false;

    const connectWs = () => {
      if (isDisposed) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          // Identify user on socket
          if (currentUser && socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'identify',
              userId: currentUser.id,
              username: currentUser.username,
              role: currentUser.role
            }));
          }

          // Heartbeat ping
          pingTimer = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ticket_created') {
              const newTicket: SupportTicket = data.ticket;
              setTickets(prev => {
                if (prev.some(t => t.id === newTicket.id)) return prev;
                return [newTicket, ...prev];
              });
              if (currentUser?.role === 'admin') {
                sfx.playNotification();
                addToast(
                  t.toasts.newTicketTitle,
                  `[${newTicket.categoryLabel}] @${newTicket.userName}: ${newTicket.subject}`,
                  'cyber'
                );
              }
            } else if (data.type === 'ticket_replied') {
              const updatedTicket: SupportTicket = data.ticket;
              setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
              setActiveTicket(prev => prev && prev.id === updatedTicket.id ? updatedTicket : prev);

              const lastMsg = updatedTicket.messages[updatedTicket.messages.length - 1];
              if (lastMsg && lastMsg.senderId !== currentUser?.id) {
                sfx.playNotification();
                if (lastMsg.senderRole === 'admin') {
                  setCsReplyPopup({
                    ticketId: updatedTicket.id,
                    ticketNumber: updatedTicket.ticketNumber || updatedTicket.id,
                    senderName: lastMsg.senderName,
                    message: lastMsg.message,
                    ticketSubject: updatedTicket.subject
                  });
                } else {
                  addToast(
                    `${t.toasts.csMsgFrom} ${lastMsg.senderName}`,
                    lastMsg.message.length > 50 ? lastMsg.message.slice(0, 50) + '...' : lastMsg.message,
                    'info'
                  );
                }
              }
            } else if (data.type === 'ticket_status_changed') {
              const { ticketId, status, updatedAt } = data;
              setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, updatedAt } : t));
              setActiveTicket(prev => prev && prev.id === ticketId ? { ...prev, status, updatedAt } : prev);
            }
          } catch (e) {
            console.error('Error handling WS message:', e);
          }
        };

        socket.onclose = () => {
          if (pingTimer) clearInterval(pingTimer);
          if (!isDisposed) {
            reconnectTimer = setTimeout(connectWs, 3000);
          }
        };

        socket.onerror = () => {
          // Socket error will trigger close
        };
      } catch {
        if (!isDisposed) {
          reconnectTimer = setTimeout(connectWs, 5000);
        }
      }
    };

    connectWs();

    return () => {
      isDisposed = true;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.close();
      }
    };
  }, [currentUser, addToast]);

  // Periodic check for notifications
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const notifs = await api.getNotifications();
        setNotifications(prev => {
          if (notifs.length > prev.length) {
            // New notification arrived!
            const latest = notifs[0];
            sfx.playNotification();
            addToast(`⚡ ${latest.title}`, latest.message, 'cyber');
          }
          return notifs;
        });
      } catch {
        // ignore
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [addToast]);

  // AUTH ACTIONS
  const login = async (username: string, pass: string) => {
    sfx.playClick();
    const result = await api.login(username, pass);
    setCurrentUser(result.user);
    sfx.playSuccess();
    addToast(
      t.toasts.loginSuccessTitle,
      t.toasts.loginSuccessMsg.replace('{name}', result.user.name),
      'success'
    );
  };

  const register = async (data: {
    username: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) => {
    sfx.playClick();
    const result = await api.register(data);
    setCurrentUser(result.user);
    sfx.playSuccess();
    addToast(
      t.toasts.registerSuccessTitle,
      t.toasts.registerSuccessMsg.replace('{name}', result.user.name),
      'success'
    );
    await refreshData();
  };

  const logout = () => {
    sfx.playClick();
    api.logout();
    setCurrentUser(null);
    if (activeView === 'dashboard') {
      setActiveView('home');
    }
    addToast(t.toasts.logoutTitle, t.toasts.logoutMsg, 'info');
  };

  // USER ROLE UPDATE: Admin ID "1" has authority
  const updateUserRole = async (targetUserId: string, newRole: UserRole) => {
    if (!currentUser || currentUser.id !== '1') {
      sfx.playClick();
      addToast(t.toasts.roleDeniedTitle, t.toasts.roleDeniedMsg, 'error');
      throw new Error(t.toasts.roleDeniedMsg);
    }

    try {
      sfx.playClick();
      const updatedUser = await api.updateUserRole(targetUserId, newRole, currentUser.id);
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
      sfx.playSuccess();
      addToast(
        t.toasts.roleUpdatedTitle,
        t.toasts.roleUpdatedMsg
          .replace('{username}', updatedUser.username)
          .replace('{role}', newRole.toUpperCase()),
        'success'
      );
      await refreshData();
    } catch (err: any) {
      addToast(t.toasts.roleFailedTitle, err.message || 'Error', 'error');
      throw err;
    }
  };

  // USER AVATAR UPDATE
  const updateUserAvatar = async (newAvatarUrl: string) => {
    if (!currentUser) {
      addToast(t.toasts.loginRequiredTitle, t.toasts.loginRequiredAvatarMsg, 'error');
      throw new Error('User not logged in');
    }

    try {
      sfx.playClick();
      const updatedUser = await api.updateUserProfile(currentUser.id, { avatar: newAvatarUrl });
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      sfx.playSuccess();
      addToast(t.toasts.avatarUpdatedTitle, t.toasts.avatarUpdatedMsg, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(t.toasts.avatarFailedTitle, err.message || 'Error', 'error');
      throw err;
    }
  };

  // PRODUCT ACTIONS
  const addProduct = async (productData: Partial<Product>) => {
    sfx.playClick();
    const newProd = await api.addProduct(productData);
    setProducts(prev => [newProd, ...prev]);
    sfx.playSuccess();
    addToast(t.toasts.productAddedTitle, t.toasts.productAddedMsg.replace('{name}', newProd.name), 'success');
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    sfx.playClick();
    const updated = await api.updateProduct(id, updates);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    sfx.playSuccess();
    addToast(t.toasts.productUpdatedTitle, t.toasts.productUpdatedMsg.replace('{name}', updated.name), 'success');
    return updated;
  };

  const deleteProduct = async (id: string) => {
    sfx.playClick();
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast(t.toasts.productDeletedTitle, t.toasts.productDeletedMsg, 'info');
  };

  // CART ACTIONS
  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    sfx.playClick();
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedSize }];
    });
    addToast(
      t.toasts.addedToCartTitle,
      t.toasts.addedToCartMsg.replace('{name}', product.name).replace('{qty}', String(quantity)),
      'cyber'
    );
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    sfx.playClick();
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === selectedSize)));
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    sfx.playClick();
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedSize === selectedSize) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  // CHECKOUT & ORDERS
  const checkoutOrder = async (orderPayload: any) => {
    sfx.playClick();
    const newOrder = await api.createOrder({
      ...orderPayload,
      userId: currentUser?.id || 'guest',
      buyerUsername: currentUser?.username || 'Guest',
      buyerName: orderPayload.buyerName || currentUser?.name || 'Pelanggan JKT48',
      buyerEmail: orderPayload.buyerEmail || currentUser?.email || ''
    });
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    sfx.playSuccess();
    const isPendingQris = newOrder.paymentMethod === 'QRIS' && newOrder.paymentStatus !== 'PAID';
    addToast(
      isPendingQris ? t.toasts.orderCreatedTitle : t.toasts.orderPaidTitle,
      (isPendingQris ? t.toasts.orderCreatedMsg : t.toasts.orderPaidMsg)
        .replace('{id}', newOrder.id)
        .replace('{total}', newOrder.total.toLocaleString('id-ID')),
      isPendingQris ? 'info' : 'success'
    );
    await refreshData();
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    sfx.playClick();
    const updated = await api.updateOrderStatus(orderId, status, trackingNumber);
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    addToast(
      t.toasts.orderStatusTitle,
      t.toasts.orderStatusMsg.replace('{id}', orderId).replace('{status}', status),
      'info'
    );
  };

  // NOTIFICATIONS
  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    sfx.playClick();
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast(t.toasts.notifTitle, t.toasts.notifAllReadMsg, 'info');
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // SUPPORT TICKETS ACTIONS
  const createTicket = async (data: {
    category: TicketCategory;
    categoryLabel: string;
    subject: string;
    message: string;
    orderId?: string;
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  }) => {
    sfx.playClick();
    const newTicket = await api.createTicket({
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || (language === 'en' ? 'Wota Customer' : 'Wota Pelanggan'),
      userUsername: currentUser?.username || 'guest',
      userEmail: currentUser?.email || '',
      userPhone: currentUser?.phone || '',
      userAvatar: currentUser?.avatar || '',
      category: data.category,
      categoryLabel: data.categoryLabel,
      subject: data.subject,
      message: data.message,
      orderId: data.orderId,
      priority: data.priority || 'NORMAL'
    });

    setTickets(prev => [newTicket, ...prev.filter(t => t.id !== newTicket.id)]);
    setActiveTicket(newTicket);
    sfx.playSuccess();
    addToast(
      t.toasts.ticketSentTitle,
      t.toasts.ticketSentMsg.replace('{id}', newTicket.id).replace('{cat}', data.categoryLabel),
      'success'
    );
    return newTicket;
  };

  const sendTicketMessage = async (ticketId: string, message: string) => {
    if (!message.trim()) return;
    sfx.playClick();
    const isCsAdmin = currentUser?.role === 'admin';
    const updatedTicket = await api.sendTicketMessage(ticketId, {
      senderId: currentUser?.id || 'guest',
      senderName: isCsAdmin ? 'Customer Service Official JKT48' : (currentUser?.name || (language === 'en' ? 'Customer' : 'Pelanggan')),
      senderRole: isCsAdmin ? 'admin' : 'user',
      message: message.trim()
    });

    setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket(updatedTicket);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    sfx.playClick();
    const updated = await api.updateTicketStatus(ticketId, status);
    setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket(updated);
    }
    addToast(
      t.toasts.ticketStatusTitle,
      t.toasts.ticketStatusMsg.replace('{id}', ticketId).replace('{status}', status),
      'info'
    );
  };

  const openChatWithOrder = (orderId: string, orderSummary?: string) => {
    sfx.playClick();
    setIsLiveChatOpen(true);
    // Find if ticket already exists for this order
    const existing = tickets.find(t => t.orderId === orderId);
    if (existing) {
      setActiveTicket(existing);
    } else {
      // Start a new ticket with order prefilled
      setActiveTicket({
        id: 'new',
        ticketNumber: 'NEW',
        userId: currentUser?.id || 'guest',
        userName: currentUser?.name || (language === 'en' ? 'Wota Customer' : 'Wota Pelanggan'),
        userUsername: currentUser?.username || 'guest',
        userEmail: currentUser?.email || '',
        userPhone: currentUser?.phone || '',
        userAvatar: currentUser?.avatar || '',
        category: 'PENGIRIMAN',
        categoryLabel: language === 'en' ? 'Shipping & Tracking' : 'Pengiriman & Ekspedisi',
        subject: language === 'en'
          ? `Help for Order #${orderId}${orderSummary ? ` (${orderSummary})` : ''}`
          : `Bantuan untuk Pesanan #${orderId}${orderSummary ? ` (${orderSummary})` : ''}`,
        status: 'OPEN',
        priority: 'HIGH',
        orderId: orderId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const markTicketRead = useCallback((ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: t.messages.map(m => ({ ...m, read: true, isRead: true }))
        };
      }
      return t;
    }));
    setCsReplyPopup(prev => prev && prev.ticketId === ticketId ? null : prev);
  }, []);

  const unreadTicketsCount = tickets.filter(t => {
    if (currentUser?.role === 'admin') {
      return t.status !== 'RESOLVED' && t.messages.some(m => m.senderRole === 'user' && !m.read);
    } else {
      const isMyTicket = currentUser ? t.userId === currentUser.id : t.userId === 'guest';
      return isMyTicket && t.messages.some(m => m.senderRole === 'admin' && !m.read);
    }
  }).length;

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        updateUserRole,
        tickets,
        activeTicket,
        setActiveTicket,
        createTicket,
        sendTicketMessage,
        updateTicketStatus,
        isLiveChatOpen,
        setIsLiveChatOpen,
        openChatWithOrder,
        unreadTicketsCount,
        markTicketRead,
        csReplyPopup,
        setCsReplyPopup,
        isWhatsAppGuideOpen,
        setIsWhatsAppGuideOpen,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        orders,
        checkoutOrder,
        updateOrderStatus,
        notifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeView,
        setActiveView,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAvatarModalOpen,
        setIsAvatarModalOpen,
        updateUserAvatar,
        authMode,
        setAuthMode,
        language,
        setLanguage,
        toggleLanguage,
        t,
        soundEnabled,
        toggleSound,
        toasts,
        addToast,
        removeToast,
        refreshData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
