import { Product, User, AdminNotification, Order } from '../types';
import { IMAGES } from '../assets/images';

export const STORE_CONFIG = {
  name: 'JKT48 OFFICIAL WEB SHOP',
  address: 'Jl. Raya Rohngawi Jawir timur kabupaten ngawiland',
  phone: '62192807322',
  whatsappNumber: '62192807322',
  whatsappUrl: 'https://wa.me/62192807322?text=Halo%20Admin%20JKT48%20Official%20Web%20Shop%2C%20saya%20ingin%20bertanya%20seputar%20merchandise%20resmi.',
  email: 'info@jkt48.com',
  operationalHours: 'Senin - Minggu: 10:00 - 21:00 WIB',
  theaterLocation: 'JKT48 Theater & Merchandise Store: Jl. Raya Rohngawi Jawir timur kabupaten ngawiland'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-freya-photopack',
    name: 'Official JKT48 Photopack Freya Jayawardana - "Joy Kick Tears" Special Edition (SSR Gold Foil)',
    category: 'Photocard',
    price: 85000,
    stock: 150,
    description: 'Photopack resmi JKT48 edisi Joy Kick Tears Handshake Festival menampilkan Freya Jayawardana mengenakan seifuku panggung teater. Berisi 5 lembar kartu foto dengan peluang 1 kartu SSR hologram foil emas bertanda tangan resmi.',
    imageUrl: IMAGES.freyaRealHsf,
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
    imageUrl: IMAGES.zeePhotopack,
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
    imageUrl: IMAGES.christyPhotopack,
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
    imageUrl: IMAGES.graciaReal,
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
    imageUrl: IMAGES.lightstickReal,
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
    imageUrl: IMAGES.annivTshirt,
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
    imageUrl: IMAGES.magicHourCd,
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
    imageUrl: IMAGES.standeeFreya,
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
    imageUrl: IMAGES.mufflerTowel,
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
    imageUrl: IMAGES.uchiwaFan,
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
];

export const INITIAL_USERS: User[] = [
  {
    id: '1', // Superadmin ID 1
    username: 'admin',
    name: 'Admin Toko Resmi JKT48',
    email: 'admin@jkt48.com',
    role: 'admin',
    isSuperAdmin: true,
    passwordHash: '8cb2237d0679ca88db6464eac60da96345513964ee712214316d29d89163ef26',
    salt: '7a840e1f3b9c65a04473e162810a9f5d',
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
    passwordHash: 'c7c2b03f0b2f5b8c9d4a8e2f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    salt: '1b4f8e9a2c3d5e6f7a8b9c0d1e2f3a4b',
    avatar: '',
    phone: '085712345678',
    address: 'Jl. Raya Rohngawi Jawir timur kabupaten ngawiland',
    createdAt: '2026-02-14T10:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-sys-001',
    type: 'SYSTEM',
    title: 'Sistem Toko JKT48 Online',
    message: 'Toko resmi JKT48 beralamat di Jl. Raya Rohngawi Jawir timur kabupaten ngawiland siap melayani pesanan fans.',
    read: true,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'notif-user-002',
    type: 'USER_REGISTERED',
    title: 'Akun Fans JKT48 Baru Terdaftar',
    message: 'User @wota_fan (Reza Pratama) baru saja bergabung menjadi member official fan store.',
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
    title: 'Pesanan Merchandise Masuk!',
    message: 'Pesanan #INV/JKT48/2026/10428 senilai Rp 345.000 dari Reza Pratama sedang disiapkan tim logistik.',
    read: false,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    metadata: {
      orderId: 'INV/JKT48/2026/10428',
      amount: 345000,
      username: 'wota_fan'
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'INV/JKT48/2026/10428',
    userId: '2',
    buyerUsername: 'wota_fan',
    buyerName: 'Reza Pratama (Wota Ngawi)',
    buyerEmail: 'reza.pratama@gmail.com',
    shipping: {
      recipientName: 'Reza Pratama',
      phone: '085712345678',
      address: 'Jl. Raya Rohngawi Jawir timur kabupaten ngawiland',
      city: 'Kabupaten Ngawiland',
      postalCode: '63211',
      courier: 'JNE Express Teater',
      shippingCost: 20000
    },
    items: [
      {
        productId: 'prod-magichour-box',
        name: 'JKT48 26th Single "Magic Hour" Special Showcase Edition (CD + DVD + Photobook)',
        price: 320000,
        quantity: 1,
        imageUrl: IMAGES.magicHourCd,
        category: 'Album'
      }
    ],
    subtotal: 320000,
    shippingFee: 20000,
    serviceFee: 5000,
    discount: 0,
    total: 345000,
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    orderStatus: 'DIPROSES',
    trackingNumber: 'JKT48-TRK-88291039',
    encryptedHash: 'f498a1c90e381b7a2d48c039e1a84f9382b6170281b3762810a98f128bc17290',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];
