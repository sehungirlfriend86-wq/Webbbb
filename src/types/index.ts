export type UserRole = 'admin' | 'user';

export interface User {
  id: string; // e.g. "1" for superadmin
  username: string;
  name: string;
  email: string;
  role: UserRole;
  isSuperAdmin?: boolean; // True for ID "1"
  passwordHash: string; // PBKDF2 / SHA-256 Encrypted
  salt: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type ProductCategory = 
  | 'T-Shirt' 
  | 'Album' 
  | 'Photocard' 
  | 'Lightstick' 
  | 'Outerwear' 
  | 'Accessories' 
  | 'Theater Exclusive'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in IDR (Rp)
  stock: number;
  description: string;
  imageUrl: string;
  memberTag?: string;
  badge?: string;
  isFeatured?: boolean;
  specs?: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export type PaymentMethod = 
  | 'QRIS' 
  | 'GOPAY' 
  | 'OVO' 
  | 'DANA' 
  | 'SHOPEEPAY' 
  | 'BCA_VA' 
  | 'MANDIRI_VA' 
  | 'BRI_VA' 
  | 'CREDIT_CARD';

export type OrderStatus = 'PENDING' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI' | 'BATAL';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
  selectedSize?: string;
}

export interface ShippingDetails {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  postalCode: string;
  courier: string;
  shippingCost: number;
}

export interface Order {
  id: string; // INV/JKT48/2026/XXXXX
  userId: string;
  buyerUsername: string;
  buyerName: string;
  buyerEmail: string;
  shipping: ShippingDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  serviceFee: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  encryptedHash: string; // Security verification hash
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'USER_REGISTERED' 
  | 'ORDER_CREATED' 
  | 'ORDER_PAID' 
  | 'STOCK_LOW' 
  | 'ROLE_CHANGED' 
  | 'TICKET_CREATED'
  | 'TICKET_REPLIED'
  | 'SYSTEM';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  metadata?: {
    userId?: string;
    username?: string;
    orderId?: string;
    ticketId?: string;
    amount?: number;
    productName?: string;
  };
}

// SUPPORT TICKET & LIVE CHAT TYPES
export type TicketCategory = 
  | 'PEMBAYARAN' 
  | 'PENGIRIMAN' 
  | 'PRODUK_RUSAK' 
  | 'STOK_PREORDER' 
  | 'GANTI_ALAMAT' 
  | 'LAINNYA';

export interface CategoryInfo {
  id: TicketCategory;
  label: string;
  name: string;
  description: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const TICKET_CATEGORIES: Record<TicketCategory, CategoryInfo> = {
  PEMBAYARAN: {
    id: 'PEMBAYARAN',
    label: 'Kendala Pembayaran / QRIS',
    name: 'Kendala Pembayaran / QRIS',
    description: 'Konfirmasi bukti transfer, status QRIS belum masuk, atau kendala VA bank',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400'
  },
  PENGIRIMAN: {
    id: 'PENGIRIMAN',
    label: 'Status Pengiriman & Cek Resi',
    name: 'Status Pengiriman & Cek Resi',
    description: 'Nomor resi belum terbit, paket terlambat, atau lacak kurir J&T/SiCepat/JNE',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400'
  },
  PRODUK_RUSAK: {
    id: 'PRODUK_RUSAK',
    label: 'Kualitas Merchandise & Garansi',
    name: 'Kualitas Merchandise & Garansi',
    description: 'Photocard robek/terlipat, segel rusak, lightstick cacat pabrik, retur pesanan',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400'
  },
  STOK_PREORDER: {
    id: 'STOK_PREORDER',
    label: 'Stok & Pre-Order Photopack SSR',
    name: 'Stok & Pre-Order Photopack SSR',
    description: 'Jadwal restock photopack oshi (Freya/Zee/Christy), pre-order kaos konser, boxset',
    color: '#a855f7',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-400'
  },
  GANTI_ALAMAT: {
    id: 'GANTI_ALAMAT',
    label: 'Perubahan Alamat & Kontak',
    name: 'Perubahan Alamat & Kontak',
    description: 'Ubah alamat pengiriman atau nomor telepon penerima sebelum paket dikirim',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-400'
  },
  LAINNYA: {
    id: 'LAINNYA',
    label: 'Pertanyaan Umum & Bantuan',
    name: 'Pertanyaan Umum & Bantuan',
    description: 'Akun member, seputar event handshake festival JKT48, dan pertanyaan lainnya',
    color: '#ec4899',
    bgClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/30',
    textClass: 'text-pink-400'
  }
};

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  senderAvatar?: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  read?: boolean;
}

export interface SupportTicket {
  id: string; // TKT-20261101-XXXX
  ticketNumber?: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar?: string;
  userEmail: string;
  userPhone?: string;
  category: TicketCategory;
  categoryLabel: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  orderId?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCountAdmin?: number;
  unreadCountUser?: number;
}
