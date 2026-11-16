import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, MessageCircle, Phone, Copy, Check, ExternalLink, Clock, MapPin, 
  ShieldCheck, HelpCircle, ArrowRight, MessageSquare, Headset 
} from 'lucide-react';

export const WhatsAppGuideModal: React.FC = () => {
  const { isWhatsAppGuideOpen, setIsWhatsAppGuideOpen, setIsLiveChatOpen, currentUser, language, t } = useStore();
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('umum');

  if (!isWhatsAppGuideOpen) return null;

  const waNumber = '62192807322';
  const displayWaNumber = '+62 192-807-322';

  const templates: Record<string, { title: string; text: string }> = language === 'en' ? {
    umum: {
      title: 'Product & General Inquiry',
      text: `Hello JKT48 CyberMerch Customer Service! I'm ${currentUser?.name || 'a Wota'} and would like to ask about JKT48 merchandise availability.`
    },
    pembayaran: {
      title: 'Payment / QRIS Confirmation',
      text: `Hello JKT48 CyberMerch CS! I'd like to confirm payment for my order under ${currentUser?.name || ''} (@${currentUser?.username || ''}).`
    },
    pengiriman: {
      title: 'Check Delivery Status / Tracking',
      text: `Hello JKT48 CyberMerch CS! Could you please check the delivery status and tracking number for my order? Thank you!`
    },
    komplain: {
      title: 'Merchandise Claim / Order Issue',
      text: `Hello JKT48 CS Admin! There is an issue/damage with my parcel. Please advise on the replacement or official warranty process.`
    }
  } : {
    umum: {
      title: 'Tanya Produk & Informasi Umum',
      text: `Halo Customer Service JKT48 CyberMerch! Saya ${currentUser?.name || 'Wota'} ingin bertanya seputar produk merchandise JKT48 dan ketersediaan stok.`
    },
    pembayaran: {
      title: 'Konfirmasi Pembayaran / Transfer',
      text: `Halo CS JKT48 CyberMerch! Saya ingin konfirmasi pembayaran untuk pesanan saya. Atas nama: ${currentUser?.name || ''} (@${currentUser?.username || ''}). Mohon bantuannya untuk verifikasi.`
    },
    pengiriman: {
      title: 'Cek Status Pengiriman / Resi',
      text: `Halo CS JKT48 CyberMerch! Saya ingin menanyakan status pengiriman dan nomor resi pesanan merchandise JKT48 saya. Terima kasih!`
    },
    komplain: {
      title: 'Komplain Produk / Kendala Pesanan',
      text: `Halo Admin CS JKT48! Paket pesanan saya terdapat kendala/kerusakan. Mohon petunjuk untuk prosedur penukaran barang atau garansi resmi.`
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(waNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentMessage = templates[selectedTemplate]?.text || templates.umum.text;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(currentMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-wide">{t.wa.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400">{t.wa.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsWhatsAppGuideOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Official Hotline Card */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">
                <Phone className="w-4 h-4" />
                <span>{t.wa.officialNumberLabel}</span>
              </div>
              <div className="text-2xl font-mono font-black text-white tracking-wider">
                {displayWaNumber}
              </div>
              <p className="text-xs text-slate-400 mt-1">Admin Customer Service Official JKT48</p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleCopyNumber}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium border border-slate-600 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.qris.copied : (language === 'en' ? 'Copy Number' : 'Salin Nomor')}</span>
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                <span>{t.wa.openWaNow}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Template Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t.wa.templatesTitle}:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(templates).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTemplate(key)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition ${
                    selectedTemplate === key
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.title}</span>
                    {selectedTemplate === key && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Template preview */}
            <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-sans text-xs text-slate-300 italic">
              <span className="font-semibold not-italic text-emerald-400 block mb-1">
                {language === 'en' ? 'Preview Message to Send:' : 'Pratinjau Pesan yang Akan Terkirim:'}
              </span>
              "{currentMessage}"
            </div>
          </div>

          {/* 4 Easy Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.wa.stepsTitle}:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">1</span>
                <div>
                  <p className="font-semibold text-slate-200">{t.wa.step1Title}</p>
                  <p className="text-slate-400 mt-0.5">{t.wa.step1Desc}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">2</span>
                <div>
                  <p className="font-semibold text-slate-200">{t.wa.step2Title}</p>
                  <p className="text-slate-400 mt-0.5">{t.wa.step2Desc}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">3</span>
                <div>
                  <p className="font-semibold text-slate-200">{t.wa.step3Title}</p>
                  <p className="text-slate-400 mt-0.5">{t.wa.step3Desc}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">4</span>
                <div>
                  <p className="font-semibold text-slate-200">{t.wa.step4Title}</p>
                  <p className="text-slate-400 mt-0.5">{t.wa.step4Desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Hours & Store Location */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">{t.wa.hoursLabel}</span>
                <span>{t.footer.hoursValue}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">{t.footer.officialAddressTitle}</span>
                <span>Jl. Raya Rohngawi Jawir timur kabupaten ngawiland</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              setIsWhatsAppGuideOpen(false);
              setIsLiveChatOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 text-xs font-semibold text-pink-400 hover:text-pink-300 py-2 px-3 rounded-lg hover:bg-pink-950/30 border border-pink-500/20 transition"
          >
            <Headset className="w-4 h-4" />
            <span>{language === 'en' ? 'Or Open Web Customer Service' : 'Atau Hubungi Customer Service'}</span>
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-3">
            <button
              onClick={() => setIsWhatsAppGuideOpen(false)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              {t.common.close}
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.wa.openWaNow}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
