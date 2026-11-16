import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderHistoryView } from './components/OrderHistoryView';
import { SecurityView } from './components/SecurityView';
import { ToastContainer } from './components/ToastContainer';
import { ImportMerchModal } from './components/ImportMerchModal';
import { ChangeAvatarModal } from './components/ChangeAvatarModal';
import { LiveChatModal } from './components/LiveChatModal';
import { WhatsAppGuideModal } from './components/WhatsAppGuideModal';
import { WhatsAppWidget, WhatsAppIcon } from './components/WhatsAppWidget';
import { Product, Order } from './types';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  ArrowUpDown, 
  Layers, 
  Heart,
  ExternalLink,
  ChevronRight,
  Music,
  ShoppingBag,
  MapPin,
  Phone,
  Camera
} from 'lucide-react';
import { STORE_CONFIG } from './data/initialData';
import { getCategoryLabel, getLocalizedProduct } from './i18n/translations';

const MainStoreContent: React.FC = () => {
  const {
    products,
    activeView,
    setActiveView,
    currentUser,
    setIsAuthModalOpen,
    setAuthMode,
    language,
    t
  } = useStore();

  // Catalog State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPromo, setCheckoutPromo] = useState<{ promoCode: string; discountAmount: number }>({
    promoCode: '',
    discountAmount: 0
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetProduct, setImportTargetProduct] = useState<Product | null>(null);

  const handleOpenImportModal = (product?: Product | null) => {
    setImportTargetProduct(product || null);
    setIsImportModalOpen(true);
  };

  const memberFilters = [
    'ALL',
    'Freya Jayawardana',
    'Azizi Asadel (Zee)',
    'Angelina Christy',
    'Shania Gracia',
    'All Member'
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(prod => {
        const loc = getLocalizedProduct(prod, language);
        const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
        const matchesMember = selectedMember === 'ALL' || (prod.memberTag && prod.memberTag.includes(selectedMember));
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          prod.name.toLowerCase().includes(q) ||
          loc.name.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          prod.category.toLowerCase().includes(q) ||
          (prod.memberTag && prod.memberTag.toLowerCase().includes(q));

        return matchesCategory && matchesMember && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedMember, searchQuery, sortBy, language]);

  const handleOpenCheckout = (promoData: { promoCode: string; discountAmount: number }) => {
    setCheckoutPromo(promoData);
    setIsCheckoutOpen(true);
  };

  const handleInstantBuy = (product: Product, quantity: number, size?: string) => {
    // Already in cart from modal, open checkout
    setCheckoutPromo({ promoCode: '', discountAmount: 0 });
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090f] text-slate-100 antialiased relative selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            {/* Hero Banner */}
            <HeroBanner
              onExploreClick={() => {
                const el = document.getElementById('merch-catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                const el = document.getElementById('merch-catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              selectedMember={selectedMember}
              onSelectMember={(member) => {
                setSelectedMember(member);
                const el = document.getElementById('merch-catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Catalog Section */}
            <section id="merch-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
              {/* Filter & Search Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#141624] border border-white/10">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t.catalog.searchPlaceholder}
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-all font-sans"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Selector */}
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl text-xs">
                    <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-[#101220]">{getCategoryLabel('ALL', language)}</option>
                      <option value="Photocard" className="bg-[#101220]">{getCategoryLabel('Photocard', language)}</option>
                      <option value="Lightstick" className="bg-[#101220]">{getCategoryLabel('Lightstick', language)}</option>
                      <option value="Album" className="bg-[#101220]">{getCategoryLabel('Album', language)}</option>
                      <option value="T-Shirt" className="bg-[#101220]">{getCategoryLabel('T-Shirt', language)}</option>
                      <option value="Accessories" className="bg-[#101220]">{getCategoryLabel('Accessories', language)}</option>
                      <option value="Outerwear" className="bg-[#101220]">{getCategoryLabel('Outerwear', language)}</option>
                    </select>
                  </div>

                  {/* Member Oshi Filter */}
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl text-xs">
                    <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <select
                      value={selectedMember}
                      onChange={e => setSelectedMember(e.target.value)}
                      className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-[#101220]">{t.catalog.allMembers}</option>
                      <option value="Freya Jayawardana" className="bg-[#101220]">Freya Jayawardana</option>
                      <option value="Azizi Asadel (Zee)" className="bg-[#101220]">Azizi Asadel (Zee)</option>
                      <option value="Angelina Christy" className="bg-[#101220]">Angelina Christy</option>
                      <option value="Shania Gracia" className="bg-[#101220]">Shania Gracia</option>
                      <option value="All Member" className="bg-[#101220]">{t.catalog.allMembersConcert}</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="featured" className="bg-[#101220]">{t.catalog.sortFeatured}</option>
                      <option value="price-asc" className="bg-[#101220]">{t.catalog.sortPriceAsc}</option>
                      <option value="price-desc" className="bg-[#101220]">{t.catalog.sortPriceDesc}</option>
                      <option value="name" className="bg-[#101220]">{t.catalog.sortName}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Grid Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                    {t.catalog.catalogueTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.catalog.showingPrefix} {filteredProducts.length} {t.catalog.showingSuffix}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenImportModal(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-950/40 border border-red-400/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t.catalog.importBtn}</span>
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setActiveView('dashboard')}
                      className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl"
                    >
                      <span>{t.catalog.adminLink}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Products Cards Grid */}
              {filteredProducts.length === 0 ? (
                <div className="p-16 rounded-3xl bg-[#141624] border border-white/10 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500">
                    <Search className="w-8 h-8" />
                  </div>
                  <h4 className="font-display font-bold text-base text-white">
                    {t.catalog.notFoundTitle}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {t.catalog.notFoundDesc}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setSelectedMember('ALL');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#d92027] text-white text-xs font-bold"
                  >
                    {t.catalog.resetFilter}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetail={setSelectedProduct}
                      onOpenImportImage={handleOpenImportModal}
                    />
                  ))}
                </div>
              )}

              {/* Official JKT48 Theater Schedule & Counter Info */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#141624] to-[#141624] border border-red-500/30 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#d92027] text-white text-xs font-bold">
                        JKT48
                      </span>
                      <h4 className="font-display font-black text-lg sm:text-xl text-white">
                        {t.catalog.theaterScheduleTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      {t.catalog.theaterScheduleSubtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 text-white">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{STORE_CONFIG.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 text-red-300 font-bold">
                      <Phone className="w-3.5 h-3.5 text-red-400" />
                      <span>{STORE_CONFIG.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Show Stage Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <div className="text-[10px] font-mono text-red-400 font-bold uppercase">SETLIST 1</div>
                    <div className="font-bold text-sm text-white">Cara Meminum Ramune</div>
                    <div className="text-xs text-slate-400">{t.catalog.setlist1Sub}</div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">{t.catalog.setlist1Badge}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <div className="text-[10px] font-mono text-red-400 font-bold uppercase">SETLIST 2</div>
                    <div className="font-bold text-sm text-white">Aturan Anti Cinta</div>
                    <div className="text-xs text-slate-400">{t.catalog.setlist2Sub}</div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">{t.catalog.setlist2Badge}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <div className="text-[10px] font-mono text-red-400 font-bold uppercase">SETLIST 3</div>
                    <div className="font-bold text-sm text-white">Tunas Dibalik Serpihan</div>
                    <div className="text-xs text-slate-400">{t.catalog.setlist3Sub}</div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">{t.catalog.setlist3Badge}</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Catalog Dedicated View */}
        {activeView === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-wider">
                Official JKT48 Web Shop
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                {t.catalog.dedicatedHeader}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {t.catalog.dedicatedSub} {STORE_CONFIG.address}.
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#141624] border border-white/10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.catalog.searchPlaceholderShort}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#121424] border border-white/10 text-white text-xs"
                >
                  <option value="ALL">{t.catalog.allCategories}</option>
                  <option value="Photocard">{getCategoryLabel('Photocard', language)}</option>
                  <option value="Lightstick">{getCategoryLabel('Lightstick', language)}</option>
                  <option value="Album">{getCategoryLabel('Album', language)}</option>
                  <option value="T-Shirt">{getCategoryLabel('T-Shirt', language)}</option>
                  <option value="Accessories">{getCategoryLabel('Accessories', language)}</option>
                  <option value="Outerwear">{getCategoryLabel('Outerwear', language)}</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#121424] border border-white/10 text-white text-xs"
                >
                  <option value="featured">{t.catalog.sortFeaturedShort}</option>
                  <option value="price-asc">{t.catalog.sortPriceAscShort}</option>
                  <option value="price-desc">{t.catalog.sortPriceDescShort}</option>
                </select>

                <button
                  onClick={() => handleOpenImportModal(null)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold border border-red-400/30 shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.catalog.importBtn}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={setSelectedProduct}
                  onOpenImportImage={handleOpenImportModal}
                />
              ))}
            </div>
          </div>
        )}

        {/* History View */}
        {activeView === 'history' && <OrderHistoryView />}

        {/* Admin Dashboard */}
        {activeView === 'dashboard' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                {t.catalog.accessDeniedTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.catalog.accessDeniedDesc}
              </p>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#d92027] hover:bg-red-600 text-white text-xs font-bold shadow-lg"
              >
                {t.catalog.loginAsAdmin}
              </button>
            </div>
          )
        )}

        {/* Security & Database Inspector */}
        {activeView === 'security' && <SecurityView />}
      </main>

      {/* Official JKT48 Website Footer */}
      <footer className="border-t border-white/10 bg-[#0c0d16] mt-20 pt-12 pb-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Col 1: Official Store Identity & Exact Address */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#d92027] flex items-center justify-center font-display font-black text-white text-base shadow">
                  48
                </div>
                <div>
                  <span className="font-display font-black text-base text-white tracking-wider block">
                    JKT48 OFFICIAL WEB SHOP
                  </span>
                  <span className="text-[10px] text-red-400 font-mono font-bold uppercase">
                    {t.footer.tagline}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-sm">
                {t.footer.desc}
              </p>

              {/* Exact Store Address & Phone Number Required */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 font-mono text-[11px] text-slate-200">
                <div className="flex items-start gap-1.5 text-white font-bold">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{t.footer.officialAddressTitle}</span>
                </div>
                <div className="pl-5 text-slate-300 font-sans font-semibold">
                  {STORE_CONFIG.address}
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-red-400 font-bold">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{t.footer.orderHotline} {STORE_CONFIG.phone}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-3 space-y-2.5">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                {t.footer.navMenuTitle}
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button onClick={() => setActiveView('home')} className="hover:text-red-400 transition-colors">
                    {t.footer.navHome}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('catalog')} className="hover:text-red-400 transition-colors">
                    {t.footer.navCatalog}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('history')} className="hover:text-red-400 transition-colors">
                    {t.footer.navHistory}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('security')} className="hover:text-red-400 transition-colors">
                    {t.footer.navWarranty}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Theater Hours */}
            <div className="md:col-span-4 space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.footer.fanCareTitle}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {t.footer.fanCareDesc}
              </p>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] space-y-1.5 text-slate-300">
                <div>{t.footer.hoursLabel} <strong className="text-white">{t.footer.hoursValue}</strong></div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span>{t.footer.csHotlineLabel}</span>
                  <a
                    href={STORE_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 border border-[#25D366]/40 font-bold transition-all shadow-sm group"
                    title={`WhatsApp: ${STORE_CONFIG.phone}`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] group-hover:text-slate-950" />
                    <span>WA {STORE_CONFIG.phone}</span>
                  </a>
                </div>
                <div>{t.footer.locationLabel} <strong className="text-white">Jl. Raya Rohngawi Jawir timur</strong></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <div>
              {t.footer.copyright}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">{t.footer.dbEncrypted}</span>
              <span>•</span>
              <span>{t.footer.district}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Overlays and Modals */}
      <CartDrawer onOpenCheckout={handleOpenCheckout} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        promoCode={checkoutPromo.promoCode}
        discountAmount={checkoutPromo.discountAmount}
        onSuccessOrder={(order) => {
          // Keep receipt modal inside CheckoutModal
        }}
      />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onInstantBuy={handleInstantBuy}
        onOpenImportImage={(prod) => {
          setSelectedProduct(null);
          handleOpenImportModal(prod);
        }}
      />
      <ImportMerchModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportTargetProduct(null);
        }}
        targetProduct={importTargetProduct}
      />
      <AuthModal />
      <ChangeAvatarModal />
      <LiveChatModal />
      <WhatsAppGuideModal />
      <ToastContainer />
      <WhatsAppWidget />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainStoreContent />
    </StoreProvider>
  );
}
