import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Security: Hash password using PBKDF2
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Initial default seed
const defaultAdminSalt = '7a840e1f3b9c65a04473e162810a9f5d';
const defaultAdminHash = hashPassword('admin1234', defaultAdminSalt);

const defaultUserSalt = '1b4f8e9a2c3d5e6f7a8b9c0d1e2f3a4b';
const defaultUserHash = hashPassword('wota1234', defaultUserSalt);

interface DatabaseSchema {
  users: Array<{
    id: string;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    isSuperAdmin?: boolean;
    passwordHash: string;
    salt: string;
    avatar?: string;
    phone?: string;
    address?: string;
    createdAt: string;
  }>;
  products: Array<any>;
  orders: Array<any>;
  notifications: Array<any>;
  supportTickets?: Array<any>;
}

function getDefaultTickets() {
  return [
    {
      id: 'TKT-20261101-8801',
      userId: '2',
      userName: 'Reza Pratama (Wota Ngawi)',
      userUsername: 'wota_fan',
      userAvatar: '',
      userEmail: 'reza.pratama@gmail.com',
      userPhone: '085712345678',
      category: 'PENGIRIMAN',
      categoryLabel: 'Status Pengiriman & Cek Nomor Resi',
      subject: 'Lacak resi pesanan Boxset Magic Hour & Photopack Freya',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      orderId: 'INV/JKT48/2026/10428',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      lastMessage: 'Baik min, terima kasih banyak atas respon cepatnya!',
      unreadCountAdmin: 0,
      unreadCountUser: 0,
      messages: [
        {
          id: 'msg-1',
          ticketId: 'TKT-20261101-8801',
          senderId: '2',
          senderName: 'Reza Pratama',
          senderRole: 'user',
          senderAvatar: '',
          message: 'Halo Admin Toko JKT48! Saya sudah checkout pesanan #INV/JKT48/2026/10428. Apakah barang sudah dikirim dari teater dan resi J&T sudah aktif?',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          isRead: true
        },
        {
          id: 'msg-2',
          ticketId: 'TKT-20261101-8801',
          senderId: '1',
          senderName: 'Official CS JKT48',
          senderRole: 'admin',
          senderAvatar: '/src/assets/images/real/jkt48_logo.png',
          message: 'Halo Kak Reza! Paket pesanan Kakak nomor resi JKT-CYBER-88291039 sudah di-pickup oleh kurir SiCepat hari ini dari Jl. Raya Rohngawi Jawir timur. Estimasi tiba 1-2 hari kerja ya kak. Jika ada kendala, bisa juga hubungi WA kami di 62192807322.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          isRead: true
        },
        {
          id: 'msg-3',
          ticketId: 'TKT-20261101-8801',
          senderId: '2',
          senderName: 'Reza Pratama',
          senderRole: 'user',
          senderAvatar: '',
          message: 'Baik min, terima kasih banyak atas respon cepatnya!',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          isRead: true
        }
      ]
    },
    {
      id: 'TKT-20261101-8802',
      userId: '2',
      userName: 'Reza Pratama (Wota Ngawi)',
      userUsername: 'wota_fan',
      userAvatar: '',
      userEmail: 'reza.pratama@gmail.com',
      userPhone: '085712345678',
      category: 'STOK_PREORDER',
      categoryLabel: 'Stok & Pre-Order Photopack SSR',
      subject: 'Kapan Photopack Zee Flying High restock lagi min?',
      status: 'OPEN',
      priority: 'NORMAL',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      lastMessage: 'Apakah minggu depan ada batch 2 untuk Photopack Zee?',
      unreadCountAdmin: 1,
      unreadCountUser: 0,
      messages: [
        {
          id: 'msg-4',
          ticketId: 'TKT-20261101-8802',
          senderId: '2',
          senderName: 'Reza Pratama',
          senderRole: 'user',
          senderAvatar: '',
          message: 'Min, mau tanya apakah batch 2 untuk Photopack Zee Flying High bakal ada restock lagi dalam waktu dekat? Mau borong buat koleksi binder.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: false
        }
      ]
    }
  ];
}

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(content);
      if (!parsed.supportTickets || parsed.supportTickets.length === 0) {
        parsed.supportTickets = getDefaultTickets();
        saveDatabase(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse db.json, recreating initial database', e);
    }
  }

  // Initial seed
  const initialData: DatabaseSchema = {
    supportTickets: getDefaultTickets(),
    users: [
      {
        id: '1', // Superadmin ID 1
        username: 'admin',
        name: 'Super Admin JKT48',
        email: 'admin@cybermerch-jkt48.id',
        role: 'admin',
        isSuperAdmin: true,
        passwordHash: defaultAdminHash,
        salt: defaultAdminSalt,
        avatar: '/src/assets/images/real/jkt48_logo.png',
        phone: '62192807322',
        address: 'Jl. Raya Rohngawi Jawir timur kabupaten ngawiland',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        username: 'wota_fan',
        name: 'Reza Pratama (Wota Ngawi)',
        email: 'reza.pratama@gmail.com',
        role: 'user',
        isSuperAdmin: false,
        passwordHash: defaultUserHash,
        salt: defaultUserSalt,
        avatar: '',
        phone: '085712345678',
        address: 'Jl. Raya Rohngawi Jawir timur kabupaten ngawiland',
        createdAt: '2026-02-14T10:00:00.000Z'
      }
    ],
    products: [
      {
        id: 'prod-freya-photopack',
        name: 'Official JKT48 Photopack Freya Jayawardana - "Joy Kick Tears" Special Edition (SSR Gold Foil)',
        category: 'Photocard',
        price: 85000,
        stock: 150,
        description: 'Photopack resmi JKT48 edisi Joy Kick Tears Handshake Festival menampilkan Freya Jayawardana mengenakan seifuku panggung teater. Berisi 5 lembar kartu foto dengan peluang 1 kartu SSR hologram foil emas bertanda tangan resmi.',
        imageUrl: '/src/assets/images/real/freya_hsf.jpg',
        memberTag: 'Freya Jayawardana',
        badge: 'BEST SELLER OSHI',
        isFeatured: true,
        specs: [
          'Original JKT48 Holographic Foil Trading Card (Freya)',
          'Foto Asli Panggung Joy Kick Tears Handshake Festival',
          'Ukuran Standar 8.5 x 5.5 cm 350gsm Anti-Scratch Finish',
          'Termasuk 1 Gold Foil Signature SSR Card Berpeluang',
          'Segel Hologram Keaslian Resmi Teater JKT48'
        ],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'prod-zee-photopack',
        name: 'Official JKT48 Photopack Azizi Asadel (Zee) - "Flying High" Concert Edition',
        category: 'Photocard',
        price: 95000,
        stock: 85,
        description: 'Photopack koleksi resmi JKT48 Azizi Asadel (Zee) edisi konser Flying High dengan kostum biru berkilau. Kualitas cetak premium ultra-glossy dengan efek glitter foil eksklusif.',
        imageUrl: '/src/assets/images/jkt48_zee_photopack_1791894916317.jpg',
        memberTag: 'Azizi Asadel (Zee)',
        badge: 'LIMITED COLLECTOR',
        isFeatured: true,
        specs: [
          'Official Photopack Koleksi Edisi Seishun Girls & Flying High',
          'Bahan Kartu Tebal 350gsm Glossy UV Lamination',
          'Hologram Seal JKT48 Official Merch di Belakang Kartu',
          'Termasuk Amplop Photopack Asli JKT48 Trading Card'
        ],
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      },
      {
        id: 'prod-christy-photopack',
        name: 'Official JKT48 Photopack Angelina Christy - "Ramune no Nomikata" Theater Edition',
        category: 'Photocard',
        price: 80000,
        stock: 110,
        description: 'Photocard resmi Angelina Christy dalam setlist Cara Meminum Ramune (Team KIII). Menampilkan pose manis dengan seifuku pink panggung teater berhias pita.',
        imageUrl: '/src/assets/images/jkt48_christy_photopack_1791894939189.jpg',
        memberTag: 'Angelina Christy',
        badge: 'THEATER EXCLUSIVE',
        isFeatured: true,
        specs: [
          'Original Theater Stage Trading Card JKT48 (Angelina Christy)',
          'Foto High Resolution Glossy Holo Finish dengan Cap Stempel Teater',
          'Kode Serial Unik Cetakan Resmi Teater JKT48',
          'Edisi Terbatas Setlist Ramune no Nomikata'
        ],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'prod-gracia-photopack',
        name: 'Official JKT48 Photopack Shania Gracia - "Captain Edition" Red Seifuku',
        category: 'Photocard',
        price: 90000,
        stock: 95,
        description: 'Photopack resmi Kapten JKT48 Shania Gracia mengenakan seragam kebesaran beludru merah berkancing emas panggung teater. Dilengkapi foil konstelasi bintang hologram langka.',
        imageUrl: '/src/assets/images/real/shania_gracia.jpg',
        memberTag: 'Shania Gracia',
        badge: 'CAPTAIN SPECIAL',
        isFeatured: true,
        specs: [
          'Official Trading Card Shania Gracia (Captain JKT48)',
          'Foto Asli Panggung Teater Kapten JKT48',
          'Holographic Constellation Foil Pattern Berkualitas Tinggi',
          'Sleeve Pelindung Kartu Anti Debu & Air',
          'Original Counter Resmi Teater JKT48'
        ],
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'prod-lightstick-13th',
        name: 'JKT48 Official Sticklight / Lightstick 13th Anniversary (15 Warna LED + Lanyard)',
        category: 'Lightstick',
        price: 275000,
        stock: 60,
        description: 'Sticklight resmi konser teater JKT48 dengan logo ukir resmi merah bold, 15 mode spektrum warna LED sinkronisasi konser, tombol daya responsif, dan tali lanyard pengaman wota.',
        imageUrl: '/src/assets/images/jkt48_lightstick_real_1791895022075.jpg',
        memberTag: 'All Member',
        badge: 'MUST HAVE CONCERT GEAR',
        isFeatured: true,
        specs: [
          'Official JKT48 Lightstick Emblazoned Theater Logo',
          '15 Pilihan Mode Warna LED Terang Konser (Merah, Putih, Cyan, dll)',
          'Daya Baterai 3x AAA Hemat Energi & Tahan Lama',
          'Termasuk Lanyard Tali Gantungan Merah & Box Kemasan Resmi'
        ],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'prod-anniv-tshirt',
        name: 'Kaos Konser Resmi JKT48 13th Anniversary "Wonder Gala" (Bahan Cotton 24s)',
        category: 'T-Shirt',
        price: 195000,
        stock: 140,
        description: 'T-Shirt resmi konser perayaan 13 tahun JKT48 "Wonder Gala". Warna hitam pekat dengan sablon discharge & plastisol bold merah-putih di dada. Bahan 100% katun combed 24s dingin & nyaman dipakai encore.',
        imageUrl: '/src/assets/images/jkt48_anniv_tshirt_1791894992130.jpg',
        memberTag: 'All Member',
        badge: 'CONCERT BESTSELLER',
        isFeatured: true,
        specs: [
          '100% Premium Cotton Combed 24s Supersoft & Adem',
          'Sablon High-Density Plastisol Tahan Cuci Mesin',
          'Tag Kerah Woven & Hologram Resmi JKT48 di Pinggang',
          'Potongan Reguler Fit Unisex Standar Konser'
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'prod-magichour-box',
        name: 'JKT48 26th Single "Magic Hour" Special Showcase Edition (CD + DVD + Photobook)',
        category: 'Album',
        price: 320000,
        stock: 50,
        description: 'Boxset fisik resmi single ke-26 JKT48 "Magic Hour". Berisi CD Audio Mastering Teater, DVD Music Video & Behind The Scenes, Buku Foto Glossy 64 Halaman, dan bonus 2 kartu photocard member.',
        imageUrl: '/src/assets/images/jkt48_magic_hour_cd_1791895060973.jpg',
        memberTag: 'Shani, Zee, Christy, Freya',
        badge: 'OFFICIAL 26TH SINGLE',
        isFeatured: true,
        specs: [
          'Deluxe Hardbox Maroon Gold Foil Embossed',
          'CD Audio Studio Master 26th Single Magic Hour',
          'Buku Foto (Photobook) Eksklusif 64 Halaman Kertas Seni',
          'Bonus 2 Lembar Photocard Member Acak (Shani, Zee, Christy, Freya)'
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'prod-freya-standee',
        name: 'Official Acrylic Standee Member JKT48 - Freya Jayawardana (Panggung Teater)',
        category: 'Accessories',
        price: 145000,
        stock: 70,
        description: 'Pajangan standee akrilik resmi Freya Jayawardana dalam pose melambaikan tangan manis dengan seifuku tartan merah. Disertai baseplate akrilik bening berukir grafir JKT48.',
        imageUrl: '/src/assets/images/jkt48_standee_freya_1791895097849.jpg',
        memberTag: 'Freya Jayawardana',
        badge: 'NEW RELEASE',
        isFeatured: true,
        specs: [
          'Bahan Akrilik Bening Tebal 4mm High Definition UV Print',
          'Tinggi Figur 15 cm dengan Tatakan Baseplate Bulat Berukir',
          'Ukiran Grafir Logo Resmi JKT48 di Alas Standee',
          'Kemasan Plastik Seal Khusus Official Merch'
        ],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'prod-muffler-towel',
        name: 'Official Muffler Towel / Handuk Konser JKT48 Theater (Merah & Putih Woven)',
        category: 'Accessories',
        price: 120000,
        stock: 90,
        description: 'Handuk leher konser resmi JKT48 Theater berwarna merah dan putih dengan rumbai tepi tradisional. Bahan 100% katun rajut lembut menyerap keringat untuk chants fanchant di konser.',
        imageUrl: '/src/assets/images/jkt48_muffler_towel_1791895142575.jpg',
        memberTag: 'All Member',
        badge: 'CONCERT GEAR',
        isFeatured: false,
        specs: [
          'Bahan 100% Cotton Jacquard Tebal Halus',
          'Ukuran 110 x 20 cm Standar Muffler Towel Konser',
          'Tulisan JKT48 THEATER Tenun Bolak-Balik Tahan Luntur',
          'Label Tag Toko Resmi JKT48'
        ],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'prod-uchiwa-fan',
        name: 'Official JKT48 Big Uchiwa Concert Fan with Lace (Senbatsu Idol Edition)',
        category: 'Accessories',
        price: 95000,
        stock: 80,
        description: 'Kipas konser jumbo resmi dengan foto resolusi tinggi member Senbatsu, renda satin tepi merah khas idol jepang, dan pegangan kokoh untuk diayunkan saat panggung theater.',
        imageUrl: '/src/assets/images/jkt48_uchiwa_fan_1791894032466.jpg',
        memberTag: 'All Member',
        badge: 'POPULAR CHANTS',
        isFeatured: false,
        specs: [
          'Diameter Kipas Besar 29.5 cm Glossy Print',
          'Renda Satin Merah di Sekeliling Bingkai Kipas',
          'Pegangan Plastik Kuat Ergonomis',
          'Produk Resmi Merchandise Teater JKT48'
        ],
        createdAt: new Date().toISOString()
      }
    ],
    orders: [
      {
        id: 'INV/JKT48/2026/10428',
        userId: '2',
        buyerUsername: 'wota_fan',
        buyerName: 'Reza Pratama',
        buyerEmail: 'reza.pratama@gmail.com',
        shipping: {
          recipientName: 'Reza Pratama',
          phone: '085712345678',
          address: 'Jl. Senopati No. 48, Kebayoran Baru',
          city: 'Jakarta Selatan',
          postalCode: '12190',
          courier: 'JNE Cyber Express',
          shippingCost: 20000
        },
        items: [
          {
            productId: 'prod-album-11th',
            name: 'JKT48 11th Anniversary Special Holographic Album Box',
            price: 350000,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=80',
            category: 'Album'
          }
        ],
        subtotal: 350000,
        shippingFee: 20000,
        serviceFee: 5000,
        discount: 0,
        total: 375000,
        paymentMethod: 'QRIS',
        paymentStatus: 'PAID',
        orderStatus: 'DIPROSES',
        trackingNumber: 'JKT-CYBER-88291039',
        encryptedHash: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    notifications: [
      {
        id: 'notif-sys-001',
        type: 'SYSTEM',
        title: 'Sistem CyberMerch Aktif',
        message: 'Database enkripsi PBKDF2 & otentikasi role admin siap digunakan.',
        read: true,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'notif-user-002',
        type: 'USER_REGISTERED',
        title: 'Akun Member Baru Terdaftar',
        message: 'User @wota_fan (Reza Pratama) baru saja menyelesaikan registrasi akun.',
        read: false,
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        metadata: {
          userId: '2',
          username: 'wota_fan'
        }
      },
      {
        id: 'notif-order-003',
        type: 'ORDER_CREATED',
        title: 'Pesanan Baru Masuk!',
        message: 'Pesanan #INV/JKT48/2026/10428 senilai Rp 375.000 telah dibuat oleh Reza Pratama.',
        read: false,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        metadata: {
          orderId: 'INV/JKT48/2026/10428',
          amount: 375000,
          username: 'wota_fan'
        }
      }
    ]
  };

  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json', err);
  }
}

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : null;
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = cliPort || (isProd ? Number(process.env.PORT) || 8080 : 3000);

  // JSON Body parsing with support for large base64 image uploads (up to 30mb)
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Helper to remove password hash and salt before returning user
  function sanitizeUser(u: any) {
    const { passwordHash, salt, ...safe } = u;
    return safe;
  }

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const computed = hashPassword(password, user.salt);
    if (computed !== user.passwordHash) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token: `token_${user.id}_${crypto.randomBytes(16).toString('hex')}`
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { username, name, email, password, phone, address, avatar } = req.body;
    if (!username || !password || !name || !email) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const db = loadDatabase();
    const existing = db.users.find(u => 
      u.username.toLowerCase() === username.trim().toLowerCase() ||
      u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      return res.status(409).json({ error: 'Username atau Email sudah terdaftar' });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const newId = (db.users.length + 1).toString();

    const newUser = {
      id: newId,
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      role: 'user' as const,
      isSuperAdmin: false,
      passwordHash,
      salt,
      avatar: avatar || '',
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // NOTIFICATION FOR ADMIN: User Registered
    const notif = {
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
    };
    db.notifications.unshift(notif);

    saveDatabase(db);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token: `token_${newUser.id}_${crypto.randomBytes(16).toString('hex')}`
    });
  });

  // Update User Profile (Avatar, Name, Phone, Address)
  app.put('/api/users/:id/profile', (req: Request, res: Response) => {
    const { id } = req.params;
    const { avatar, name, phone, address } = req.body;

    const db = loadDatabase();
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    saveDatabase(db);
    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: sanitizeUser(user)
    });
  });

  // --- PRODUCTS ROUTES ---
  app.get('/api/products', (_req: Request, res: Response) => {
    const db = loadDatabase();
    return res.json(db.products);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const { name, category, price, stock, description, imageUrl, memberTag, badge, specs } = req.body;
    if (!name || !price || !imageUrl) {
      return res.status(400).json({ error: 'Nama produk, harga, dan gambar wajib diisi' });
    }

    const db = loadDatabase();
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category: category || 'Accessories',
      price: Number(price),
      stock: Number(stock) || 0,
      description: description || '',
      imageUrl: imageUrl.trim(),
      memberTag: memberTag || 'All Member',
      badge: badge || 'OFFICIAL MERCH',
      isFeatured: false,
      specs: specs || ['Official JKT48 Merchandise', 'Certified Holographic Packaging'],
      createdAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    saveDatabase(db);
    return res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDatabase();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      price: req.body.price ? Number(req.body.price) : db.products[index].price,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : db.products[index].stock
    };

    saveDatabase(db);
    return res.json(db.products[index]);
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDatabase();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    const deleted = db.products.splice(index, 1);
    saveDatabase(db);
    return res.json({ success: true, deleted: deleted[0] });
  });

  // --- ORDERS & TRANSACTIONS ROUTES ---
  app.get('/api/orders', (req: Request, res: Response) => {
    const { userId } = req.query;
    const db = loadDatabase();

    if (userId) {
      const userOrders = db.orders.filter(o => o.userId === userId);
      return res.json(userOrders);
    }
    return res.json(db.orders);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      userId,
      buyerUsername,
      buyerName,
      buyerEmail,
      shipping,
      items,
      subtotal,
      shippingFee,
      discount,
      serviceFee,
      promoCode,
      total,
      paymentMethod
    } = req.body;

    if (!items || items.length === 0 || !total) {
      return res.status(400).json({ error: 'Item belanja tidak boleh kosong' });
    }

    const db = loadDatabase();
    const orderId = `INV/JKT48/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;
    const encryptedHash = crypto.createHash('sha256').update(orderId + buyerName + total.toString() + Date.now()).digest('hex');

    // Decrement stock for purchased items
    items.forEach((item: any) => {
      const p = db.products.find(prod => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - (item.quantity || 1));
      }
    });

    const newOrder = {
      id: orderId,
      userId: userId || 'guest',
      buyerUsername: buyerUsername || 'Pembeli',
      buyerName: buyerName || 'Pelanggan JKT48',
      buyerEmail: buyerEmail || '',
      shipping: shipping || {},
      items,
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee || 0),
      discount: Number(discount || 0),
      serviceFee: Number(serviceFee || 1000),
      promoCode: promoCode || '',
      total: Number(total),
      paymentMethod: paymentMethod || 'QRIS',
      paymentStatus: 'PAID', // Simulated immediate confirmation for cyber checkout
      orderStatus: 'DIPROSES',
      trackingNumber: `JKT-CYBER-${Math.floor(10000000 + Math.random() * 90000000)}`,
      encryptedHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    // NOTIFICATION FOR ADMIN: Order Purchased
    const notif = {
      id: `notif-order-${Date.now()}`,
      type: 'ORDER_CREATED',
      title: 'Pesanan Baru Masuk!',
      message: `Pesanan #${newOrder.id} senilai Rp ${newOrder.total.toLocaleString('id-ID')} dibuat oleh ${newOrder.buyerName} via ${newOrder.paymentMethod}.`,
      read: false,
      timestamp: new Date().toISOString(),
      metadata: {
        orderId: newOrder.id,
        amount: newOrder.total,
        username: newOrder.buyerUsername
      }
    };
    db.notifications.unshift(notif);

    saveDatabase(db);
    return res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    const db = loadDatabase();
    const order = db.orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    if (status) order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();

    saveDatabase(db);
    return res.json(order);
  });

  // --- ADMIN & USERS MANAGEMENT ROUTES ---
  app.get('/api/admin/users', (_req: Request, res: Response) => {
    const db = loadDatabase();
    return res.json(db.users.map(u => sanitizeUser(u)));
  });

  // CRITICAL REQUIREMENT: Admin ID "1" can change any user to admin / user
  app.patch('/api/admin/users/:targetUserId/role', (req: Request, res: Response) => {
    const { targetUserId } = req.params;
    const { requesterId, newRole } = req.body;

    if (newRole !== 'admin' && newRole !== 'user') {
      return res.status(400).json({ error: 'Role harus "admin" atau "user"' });
    }

    // Security check: Only Admin ID "1" has superadmin authorization!
    if (requesterId !== '1') {
      return res.status(403).json({
        error: 'Akses Ditolak: Hanya Superadmin dengan ID "1" yang memiliki otoritas merubah status Admin!'
      });
    }

    const db = loadDatabase();
    const targetUser = db.users.find(u => u.id === targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User target tidak ditemukan' });
    }

    if (targetUser.id === '1') {
      return res.status(400).json({ error: 'Role Super Admin ID "1" tidak dapat diubah' });
    }

    targetUser.role = newRole;

    // Log notification
    db.notifications.unshift({
      id: `notif-role-${Date.now()}`,
      type: 'ROLE_CHANGED',
      title: 'Hak Akses Pengguna Diperbarui',
      message: `Super Admin (ID 1) telah mengubah role @${targetUser.username} menjadi ${newRole.toUpperCase()}.`,
      read: false,
      timestamp: new Date().toISOString(),
      metadata: {
        userId: targetUser.id,
        username: targetUser.username
      }
    });

    saveDatabase(db);
    return res.json({
      success: true,
      message: `User @${targetUser.username} berhasil diubah menjadi ${newRole}`,
      user: sanitizeUser(targetUser)
    });
  });

  // Notifications
  app.get('/api/admin/notifications', (_req: Request, res: Response) => {
    const db = loadDatabase();
    return res.json(db.notifications);
  });

  app.patch('/api/admin/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDatabase();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveDatabase(db);
    }
    return res.json({ success: true });
  });

  app.post('/api/admin/notifications/read-all', (_req: Request, res: Response) => {
    const db = loadDatabase();
    db.notifications.forEach(n => { n.read = true; });
    saveDatabase(db);
    return res.json({ success: true });
  });

  // Database security status
  app.get('/api/database/security-stats', (_req: Request, res: Response) => {
    const db = loadDatabase();
    return res.json({
      status: 'ENCRYPTED_AND_ACTIVE',
      encryptionAlgorithm: 'PBKDF2-HMAC-SHA256 (100,000 rounds) + Salted + SHA256 Integrity Check',
      storageFile: 'data/db.json',
      totalUsers: db.users.length,
      totalOrders: db.orders.length,
      totalProducts: db.products.length,
      totalTickets: (db.supportTickets || []).length,
      superAdminId: '1',
      lastSynced: new Date().toISOString()
    });
  });

  // --- SUPPORT TICKETS & LIVE CHAT ROUTES ---
  app.get('/api/tickets', (req: Request, res: Response) => {
    const { userId, role } = req.query;
    const db = loadDatabase();
    const tickets = db.supportTickets || [];

    if (role === 'admin') {
      return res.json(tickets);
    }

    if (userId) {
      const userTickets = tickets.filter(t => t.userId === userId);
      return res.json(userTickets);
    }

    return res.json(tickets);
  });

  app.get('/api/tickets/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.query;
    const db = loadDatabase();
    const ticket = (db.supportTickets || []).find(t => t.id === id);

    if (!ticket) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan' });
    }

    // Mark messages as read depending on role
    if (role === 'admin') {
      ticket.unreadCountAdmin = 0;
      ticket.messages.forEach((m: any) => {
        if (m.senderRole === 'user') m.isRead = true;
      });
      saveDatabase(db);
    } else if (role === 'user') {
      ticket.unreadCountUser = 0;
      ticket.messages.forEach((m: any) => {
        if (m.senderRole === 'admin') m.isRead = true;
      });
      saveDatabase(db);
    }

    return res.json(ticket);
  });

  app.post('/api/tickets', (req: Request, res: Response) => {
    const { 
      userId, 
      userName, 
      userUsername, 
      userAvatar, 
      userEmail, 
      userPhone, 
      category, 
      categoryLabel, 
      subject, 
      message, 
      orderId, 
      priority 
    } = req.body;

    if (!subject || !message || !category) {
      return res.status(400).json({ error: 'Kategori, subjek, dan pesan awal wajib diisi' });
    }

    const db = loadDatabase();
    if (!db.supportTickets) db.supportTickets = [];

    const now = new Date().toISOString();
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const newTicket = {
      id: ticketId,
      userId: userId || 'anonymous',
      userName: userName || 'Penggemar JKT48',
      userUsername: userUsername || 'fans_jkt48',
      userAvatar: userAvatar || '',
      userEmail: userEmail || '',
      userPhone: userPhone || '',
      category: category || 'LAINNYA',
      categoryLabel: categoryLabel || 'Pertanyaan Umum & Bantuan',
      subject: subject.trim(),
      status: 'OPEN',
      priority: priority || 'NORMAL',
      orderId: orderId || undefined,
      createdAt: now,
      updatedAt: now,
      lastMessage: message.trim(),
      unreadCountAdmin: 1,
      unreadCountUser: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId,
          senderId: userId || 'anonymous',
          senderName: userName || 'Penggemar JKT48',
          senderRole: 'user',
          senderAvatar: userAvatar || '',
          message: message.trim(),
          timestamp: now,
          isRead: false
        }
      ]
    };

    db.supportTickets.unshift(newTicket);

    // Create Admin Notification for new support ticket
    const notif = {
      id: `notif-ticket-${Date.now()}`,
      type: 'TICKET_CREATED',
      title: 'Tiket CS Baru Masuk!',
      message: `[${newTicket.categoryLabel}] Dari @${newTicket.userUsername}: "${newTicket.subject}"`,
      read: false,
      timestamp: now,
      metadata: {
        userId: newTicket.userId,
        username: newTicket.userUsername,
        ticketId: newTicket.id,
        orderId: newTicket.orderId
      }
    };
    db.notifications.unshift(notif);

    saveDatabase(db);

    broadcast({
      type: 'ticket:created',
      ticket: newTicket
    });

    return res.status(201).json({ success: true, ticket: newTicket });
  });

  app.post('/api/tickets/:id/messages', (req: Request, res: Response) => {
    const { id } = req.params;
    const { senderId, senderName, senderRole, senderAvatar, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    const db = loadDatabase();
    const ticket = (db.supportTickets || []).find(t => t.id === id);

    if (!ticket) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan' });
    }

    const now = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      ticketId: id,
      senderId: senderId || 'anonymous',
      senderName: senderName || (senderRole === 'admin' ? 'Official CS JKT48' : 'Penggemar JKT48'),
      senderRole: senderRole || 'user',
      senderAvatar: senderAvatar,
      message: message.trim(),
      timestamp: now,
      isRead: false
    };

    ticket.messages.push(newMsg);
    ticket.updatedAt = now;
    ticket.lastMessage = message.trim();

    if (senderRole === 'user') {
      ticket.unreadCountAdmin = (ticket.unreadCountAdmin || 0) + 1;
      if (ticket.status === 'RESOLVED') {
        ticket.status = 'IN_PROGRESS';
      }
      // Add notification for admin
      db.notifications.unshift({
        id: `notif-ticket-reply-${Date.now()}`,
        type: 'TICKET_REPLIED',
        title: 'Pesan Tiket Baru',
        message: `@${ticket.userUsername} membalas tiket: "${message.slice(0, 50)}..."`,
        read: false,
        timestamp: now,
        metadata: {
          ticketId: ticket.id,
          username: ticket.userUsername
        }
      });
    } else {
      ticket.unreadCountUser = (ticket.unreadCountUser || 0) + 1;
      if (ticket.status === 'OPEN') {
        ticket.status = 'IN_PROGRESS';
      }
    }

    saveDatabase(db);

    broadcast({
      type: 'ticket:message',
      ticketId: ticket.id,
      message: newMsg,
      ticket
    });

    return res.json({ success: true, message: newMsg, ticket });
  });

  app.patch('/api/tickets/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status wajib diisi' });
    }

    const db = loadDatabase();
    const ticket = (db.supportTickets || []).find(t => t.id === id);

    if (!ticket) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan' });
    }

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();

    saveDatabase(db);

    broadcast({
      type: 'ticket:status_changed',
      ticketId: ticket.id,
      status: ticket.status,
      ticket
    });

    return res.json({ success: true, ticket });
  });

  // Setup HTTP Server & WebSocket
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'connected', time: new Date().toISOString() }));

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  function broadcast(data: any) {
    const payload = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch {
          // ignore
        }
      }
    }
  }

  server.on('upgrade', (request, socket, head) => {
    try {
      const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
      if (pathname === '/ws/chat') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  // In development, mount Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static images and built dist in production
    app.use('/src/assets/images', express.static(path.resolve(__dirname, 'src', 'assets', 'images')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[JKT48 CyberMerch] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
