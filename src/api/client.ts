import { Product, User, Order, AdminNotification, UserRole, SupportTicket, TicketMessage, TicketCategory } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_NOTIFICATIONS, INITIAL_ORDERS } from '../data/initialData';
import { hashPassword, generateSalt } from '../utils/crypto';

const STORAGE_KEYS = {
  USER: 'jkt48_current_user',
  USERS: 'jkt48_db_users_v6',
  PRODUCTS: 'jkt48_official_products_v6',
  ORDERS: 'jkt48_db_orders_v6',
  NOTIFICATIONS: 'jkt48_db_notifications_v6',
  TICKETS: 'jkt48_db_tickets_v6',
};

// Safe localStorage helpers
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

export const api = {
  // --- AUTH ---
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.USER, data.user);
        return data;
      }
      const err = await res.json();
      throw new Error(err.error || 'Login gagal');
    } catch (e: any) {
      // Local fallback
      const users: User[] = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
      const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      
      // Special check for default admin & wota user
      const isDefaultAdmin = username.trim().toLowerCase() === 'admin' && password === 'admin1234';
      const isDefaultUser = username.trim().toLowerCase() === 'wota_fan' && password === 'wota1234';

      if (isDefaultAdmin && (!found || found.id === '1')) {
        const adminUser = users.find(u => u.id === '1') || INITIAL_USERS[0];
        setLocal(STORAGE_KEYS.USER, adminUser);
        return { user: adminUser, token: 'mock_token_admin_1' };
      }

      if (isDefaultUser && found) {
        setLocal(STORAGE_KEYS.USER, found);
        return { user: found, token: 'mock_token_user_2' };
      }

      if (found) {
        const computedHash = await hashPassword(password, found.salt);
        if (computedHash === found.passwordHash) {
          setLocal(STORAGE_KEYS.USER, found);
          return { user: found, token: `mock_token_${found.id}` };
        }
      }

      throw new Error(e.message || 'Username atau password salah');
    }
  },

  async register(data: {
    username: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        setLocal(STORAGE_KEYS.USER, resData.user);
        return resData;
      }
      const err = await res.json();
      throw new Error(err.error || 'Registrasi gagal');
    } catch (e: any) {
      // Local fallback
      const users: User[] = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
      if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase() || u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('Username atau Email sudah terdaftar');
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(data.password, salt);
      const newUser: User = {
        id: (users.length + 1).toString(),
        username: data.username.trim(),
        name: data.name.trim(),
        email: data.email.trim(),
        role: 'user',
        isSuperAdmin: false,
        passwordHash,
        salt,
        phone: data.phone || '',
        address: data.address || '',
        avatar: data.avatar || '',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setLocal(STORAGE_KEYS.USERS, users);
      setLocal(STORAGE_KEYS.USER, newUser);

      // Create Admin notification
      const notifs: AdminNotification[] = getLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      notifs.unshift({
        id: `notif-user-${Date.now()}`,
        type: 'USER_REGISTERED',
        title: 'Member Baru Terdaftar',
        message: `User @${newUser.username} (${newUser.name}) baru saja membuat akun di JKT48 CyberMerch.`,
        read: false,
        timestamp: new Date().toISOString(),
        metadata: {
          userId: newUser.id,
          username: newUser.username
        }
      });
      setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);

      return { user: newUser, token: `token_${newUser.id}` };
    }
  },

  getCurrentUser(): User | null {
    return getLocal(STORAGE_KEYS.USER, null);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('jkt48_db_products');
      } catch {}
    }
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data: Product[] = await res.json();
        // Check if data contains old generic images
        const hasLegacy = data.some(p => p.imageUrl && p.imageUrl.includes('unsplash.com/photo-1521572267360'));
        if (hasLegacy) {
          setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
          return INITIAL_PRODUCTS;
        }
        setLocal(STORAGE_KEYS.PRODUCTS, data);
        return data;
      }
    } catch {
      // ignore
    }
    const local = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const hasLegacy = local.some(p => p.imageUrl && p.imageUrl.includes('unsplash.com/photo-1521572267360'));
    if (hasLegacy || local.length === 0) {
      setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return local;
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const newProd = await res.json();
        const existing = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        setLocal(STORAGE_KEYS.PRODUCTS, [newProd, ...existing]);
        return newProd;
      }
    } catch {
      // ignore
    }
    // Local fallback
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: product.name || 'Produk Baru',
      category: product.category || 'Accessories',
      price: product.price || 0,
      stock: product.stock || 0,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      memberTag: product.memberTag || 'All Member',
      badge: product.badge || 'OFFICIAL MERCH',
      isFeatured: false,
      specs: product.specs || ['Official Merchandise JKT48', 'Anti-Counterfeit Hologram'],
      createdAt: new Date().toISOString()
    };
    const existing = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const updated = [newProd, ...existing];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS).map(p => p.id === id ? updated : p);
        setLocal(STORAGE_KEYS.PRODUCTS, prods);
        return updated;
      }
    } catch {
      // ignore
    }
    const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const idx = prods.findIndex(p => p.id === id);
    if (idx !== -1) {
      prods[idx] = { ...prods[idx], ...updates };
      setLocal(STORAGE_KEYS.PRODUCTS, prods);
      return prods[idx];
    }
    throw new Error('Produk tidak ditemukan');
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS).filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PRODUCTS, prods);
    return true;
  },

  // --- ORDERS ---
  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.ORDERS, data);
        return data;
      }
    } catch {
      // ignore
    }
    const all = getLocal(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return userId ? all.filter((o: Order) => o.userId === userId) : all;
  },

  async createOrder(orderData: any): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const newOrder = await res.json();
        const allOrders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
        setLocal(STORAGE_KEYS.ORDERS, [newOrder, ...allOrders]);
        return newOrder;
      }
    } catch {
      // ignore
    }
    // Local fallback
    const orderId = `INV/JKT48/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: orderId,
      userId: orderData.userId || 'guest',
      buyerUsername: orderData.buyerUsername || 'User',
      buyerName: orderData.buyerName || 'Pelanggan JKT48',
      buyerEmail: orderData.buyerEmail || '',
      shipping: orderData.shipping,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingFee: orderData.shippingFee,
      discount: orderData.discount || 0,
      serviceFee: orderData.serviceFee || 1000,
      promoCode: orderData.promoCode,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod || 'QRIS',
      paymentStatus: 'PAID',
      orderStatus: 'DIPROSES',
      trackingNumber: `JKT-CYBER-${Math.floor(10000000 + Math.random() * 90000000)}`,
      encryptedHash: generateSalt(32),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allOrders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    setLocal(STORAGE_KEYS.ORDERS, [newOrder, ...allOrders]);

    // Add notification
    const notifs = getLocal<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.unshift({
      id: `notif-order-${Date.now()}`,
      type: 'ORDER_CREATED',
      title: 'Pesanan Baru Masuk!',
      message: `Pesanan #${newOrder.id} senilai Rp ${newOrder.total.toLocaleString('id-ID')} dibuat oleh ${newOrder.buyerName}.`,
      read: false,
      timestamp: new Date().toISOString(),
      metadata: {
        orderId: newOrder.id,
        amount: newOrder.total,
        username: newOrder.buyerUsername
      }
    });
    setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);

    return newOrder;
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find(o => o.id === id);
    if (order) {
      order.orderStatus = status as any;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      order.updatedAt = new Date().toISOString();
      setLocal(STORAGE_KEYS.ORDERS, orders);
      return order;
    }
    throw new Error('Pesanan tidak ditemukan');
  },

  // --- ADMIN USERS & ROLE MANAGEMENT ---
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        setLocal(STORAGE_KEYS.USERS, users);
        return users;
      }
    } catch {
      // ignore
    }
    return getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  async updateUserProfile(userId: string, data: { avatar?: string; name?: string; phone?: string; address?: string }): Promise<User> {
    try {
      const res = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        setLocal(STORAGE_KEYS.USER, resData.user);
        const allUsers: User[] = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
        const idx = allUsers.findIndex(u => u.id === userId);
        if (idx !== -1) {
          allUsers[idx] = { ...allUsers[idx], ...data };
          setLocal(STORAGE_KEYS.USERS, allUsers);
        }
        return resData.user;
      }
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui profil');
    } catch (e: any) {
      const allUsers: User[] = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
      const idx = allUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        allUsers[idx] = { ...allUsers[idx], ...data };
        setLocal(STORAGE_KEYS.USERS, allUsers);
        setLocal(STORAGE_KEYS.USER, allUsers[idx]);
        return allUsers[idx];
      }
      const currentUser = getLocal<User | null>(STORAGE_KEYS.USER, null);
      if (currentUser && currentUser.id === userId) {
        const updated = { ...currentUser, ...data };
        setLocal(STORAGE_KEYS.USER, updated);
        return updated;
      }
      throw new Error('User tidak ditemukan');
    }
  },

  // REQUIREMENT: Admin ID "1" can change any user to admin / user
  async updateUserRole(targetUserId: string, newRole: UserRole, requesterId: string): Promise<User> {
    if (requesterId !== '1') {
      throw new Error('Akses Ditolak: Hanya Superadmin dengan ID "1" yang berhak merubah role admin!');
    }

    try {
      const res = await fetch(`/api/admin/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId, newRole })
      });
      if (res.ok) {
        const data = await res.json();
        const users = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS).map(u => 
          u.id === targetUserId ? { ...u, role: newRole } : u
        );
        setLocal(STORAGE_KEYS.USERS, users);
        return data.user;
      }
      const err = await res.json();
      throw new Error(err.error || 'Gagal merubah role');
    } catch (e: any) {
      const users = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
      const target = users.find(u => u.id === targetUserId);
      if (!target) throw new Error('User tidak ditemukan');
      if (target.id === '1') throw new Error('Role Super Admin ID "1" tidak dapat diubah');

      target.role = newRole;
      setLocal(STORAGE_KEYS.USERS, users);

      // Notification
      const notifs = getLocal<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      notifs.unshift({
        id: `notif-role-${Date.now()}`,
        type: 'ROLE_CHANGED',
        title: 'Hak Akses Pengguna Diperbarui',
        message: `Super Admin (ID 1) telah mengubah role @${target.username} menjadi ${newRole.toUpperCase()}.`,
        read: false,
        timestamp: new Date().toISOString(),
        metadata: { userId: target.id, username: target.username }
      });
      setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);

      return target;
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<AdminNotification[]> {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.NOTIFICATIONS, data);
        return data;
      }
    } catch {
      // ignore
    }
    return getLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      // ignore
    }
    const notifs = getLocal<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const n = notifs.find(item => item.id === id);
    if (n) {
      n.read = true;
      setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'POST' });
    } catch {
      // ignore
    }
    const notifs = getLocal<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.forEach(n => { n.read = true; });
    setLocal(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  // --- SUPPORT TICKETS & LIVE CHAT ---
  async getTickets(userId?: string, role?: string): Promise<SupportTicket[]> {
    try {
      const query = new URLSearchParams();
      if (userId) query.append('userId', userId);
      if (role) query.append('role', role);
      const res = await fetch(`/api/tickets?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.TICKETS, data);
        return data;
      }
    } catch {
      // fallback
    }
    const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
    if (role === 'admin') return all;
    if (userId) return all.filter(t => t.userId === userId);
    return all;
  },

  async getTicketById(ticketId: string, role?: string): Promise<SupportTicket> {
    try {
      const res = await fetch(`/api/tickets/${ticketId}${role ? `?role=${role}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // fallback
    }
    const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
    const found = all.find(t => t.id === ticketId);
    if (!found) throw new Error('Tiket tidak ditemukan');
    return found;
  },

  async createTicket(payload: {
    userId: string;
    userName: string;
    userUsername: string;
    userAvatar?: string;
    userEmail?: string;
    userPhone?: string;
    category: TicketCategory;
    categoryLabel: string;
    subject: string;
    message: string;
    orderId?: string;
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  }): Promise<SupportTicket> {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
        setLocal(STORAGE_KEYS.TICKETS, [data.ticket, ...all]);
        return data.ticket;
      }
      const err = await res.json();
      throw new Error(err.error || 'Gagal membuat tiket');
    } catch (e: any) {
      // Local fallback
      const now = new Date().toISOString();
      const newTicket: SupportTicket = {
        id: `TKT-${Date.now().toString(36).toUpperCase()}`,
        userId: payload.userId,
        userName: payload.userName,
        userUsername: payload.userUsername,
        userAvatar: payload.userAvatar,
        userEmail: payload.userEmail || '',
        userPhone: payload.userPhone || '',
        category: payload.category,
        categoryLabel: payload.categoryLabel,
        subject: payload.subject,
        status: 'OPEN',
        priority: payload.priority || 'NORMAL',
        orderId: payload.orderId,
        createdAt: now,
        updatedAt: now,
        lastMessage: payload.message,
        unreadCountAdmin: 1,
        unreadCountUser: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            ticketId: `TKT-${Date.now().toString(36).toUpperCase()}`,
            senderId: payload.userId,
            senderName: payload.userName,
            senderRole: 'user',
            senderAvatar: payload.userAvatar,
            message: payload.message,
            timestamp: now,
            isRead: false
          }
        ]
      };
      const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
      setLocal(STORAGE_KEYS.TICKETS, [newTicket, ...all]);
      return newTicket;
    }
  },

  async sendTicketMessage(ticketId: string, payload: {
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'admin';
    senderAvatar?: string;
    message: string;
  }): Promise<SupportTicket> {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
        const idx = all.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
          all[idx] = data.ticket;
          setLocal(STORAGE_KEYS.TICKETS, all);
        }
        return data.ticket;
      }
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengirim pesan');
    } catch (e: any) {
      const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
      const ticket = all.find(t => t.id === ticketId);
      if (!ticket) throw new Error('Tiket tidak ditemukan');
      const now = new Date().toISOString();
      const newMsg: TicketMessage = {
        id: `msg-${Date.now()}`,
        ticketId,
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        senderAvatar: payload.senderAvatar,
        message: payload.message,
        timestamp: now,
        isRead: false
      };
      ticket.messages.push(newMsg);
      ticket.updatedAt = now;
      ticket.lastMessage = payload.message;
      if (payload.senderRole === 'user') {
        ticket.unreadCountAdmin = (ticket.unreadCountAdmin || 0) + 1;
      } else {
        ticket.unreadCountUser = (ticket.unreadCountUser || 0) + 1;
      }
      setLocal(STORAGE_KEYS.TICKETS, all);
      return ticket;
    }
  },

  async updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'): Promise<SupportTicket> {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
        const idx = all.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
          all[idx] = data.ticket;
          setLocal(STORAGE_KEYS.TICKETS, all);
        }
        return data.ticket;
      }
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengubah status tiket');
    } catch (e: any) {
      const all = getLocal<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
      const ticket = all.find(t => t.id === ticketId);
      if (!ticket) throw new Error('Tiket tidak ditemukan');
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      setLocal(STORAGE_KEYS.TICKETS, all);
      return ticket;
    }
  }
};
