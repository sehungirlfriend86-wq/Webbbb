import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatIDR } from '../utils/crypto';
import { useStore } from '../context/StoreContext';
import { QrCode, Download, Copy, CheckCircle2, Clock, RefreshCw, ShieldCheck } from 'lucide-react';

interface QRISPaymentCardProps {
  amount: number;
  merchantName?: string;
  referenceId: string;
  isVerified: boolean;
  onVerifyPayment: () => void;
  onCopySuccess?: (label: string) => void;
}

// Compute CRC16-CCITT (0xFFFF) required by EMVCo / QRIS specification (Tag 63)
function crc16ccitt(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

export function buildQrisPayload(amount: number, referenceId: string, merchantName = 'JKT48 OFFICIAL SHOP'): string {
  const cleanMerchant = merchantName.toUpperCase().slice(0, 25);
  const amountStr = Math.max(0, Math.round(amount)).toString();
  const merchantAccountInfo =
    tlv('00', 'ID.CO.JKT48SHOP.WWW') +
    tlv('01', '9360091800048048480') +
    tlv('02', 'ID1026048048480') +
    tlv('03', 'UMI');

  const additionalData = tlv('01', referenceId.slice(0, 25));

  const basePayload =
    tlv('00', '01') +
    tlv('01', '12') + // Dynamic QRIS
    tlv('26', merchantAccountInfo) +
    tlv('52', '5999') +
    tlv('53', '360') + // IDR
    tlv('54', amountStr) +
    tlv('58', 'ID') +
    tlv('59', cleanMerchant) +
    tlv('60', 'NGAWILAND') +
    tlv('61', '63211') +
    tlv('62', additionalData) +
    '6304';

  return basePayload + crc16ccitt(basePayload);
}

export const QRISPaymentCard: React.FC<QRISPaymentCardProps> = ({
  amount,
  merchantName = 'JKT48 OFFICIAL SHOP',
  referenceId,
  isVerified,
  onVerifyPayment,
  onCopySuccess
}) => {
  const { language, t } = useStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const qrisString = buildQrisPayload(amount, referenceId, merchantName);

  // Generate QR code locally via qrcode library
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrisString, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(err => {
        console.error('QRIS generation failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [qrisString]);

  // Live 15-minute expiry countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QRIS-JKT48-${referenceId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onCopySuccess?.(
      language === 'en'
        ? 'QRIS image saved to your device.'
        : 'Gambar QRIS berhasil diunduh ke perangkat Anda.'
    );
  };

  const handleSimulateCheck = () => {
    if (isVerified || isChecking) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      onVerifyPayment();
    }, 600);
  };

  return (
    <div className="rounded-2xl bg-[#131626] border border-rose-500/30 p-4 sm:p-5 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-lg bg-white text-[#d92027] font-display font-black text-sm tracking-tight shadow-sm">
            QRIS
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {t.qris.merchantVerified}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              NMID: ID1026048048480
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          <span>{t.qris.expiresIn} {mins}:{secs}</span>
        </div>
      </div>

      {/* Main Split: White QRIS Frame + Details & Actions */}
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-5">
        {/* Crisp White Scannable QR Card */}
        <div className="bg-white rounded-2xl p-3.5 shadow-xl flex flex-col items-center shrink-0 w-48 border-2 border-slate-200">
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
            <span className="font-display font-black text-xs text-slate-900 tracking-tight">
              QRIS
            </span>
            <span className="text-[9px] font-mono font-bold text-[#d92027] uppercase">
              {language === 'en' ? 'Dynamic' : 'Dinamis'}
            </span>
          </div>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QRIS ${formatIDR(amount)}`}
              className="w-36 h-36 object-contain"
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
              <QrCode className="w-10 h-10" />
            </div>
          )}

          <div className="w-full mt-2 pt-1.5 border-t border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-800 truncate">
              {merchantName}
            </div>
            <div className="text-[11px] font-mono font-black text-[#d92027] tabular-nums">
              {formatIDR(amount)}
            </div>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex-1 flex flex-col justify-between space-y-3 text-xs w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-xl border border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 block">{t.qris.amountDue}</span>
                <span className="font-display font-extrabold text-base text-rose-400 tabular-nums">
                  {formatIDR(amount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(Math.round(amount).toString());
                  onCopySuccess?.(
                    language === 'en'
                      ? `Amount ${formatIDR(amount)} copied.`
                      : `Nominal ${formatIDR(amount)} disalin.`
                  );
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{t.qris.copyAmount}</span>
              </button>
            </div>

            <div className="text-slate-300 leading-relaxed">
              {t.qris.scanInstruction}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {t.qris.supportedApps}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.qris.downloadQr}</span>
            </button>

            {isVerified ? (
              <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'QRIS Payment Confirmed' : 'Pembayaran QRIS Terkonfirmasi'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateCheck}
                disabled={isChecking}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'en' ? 'Checking QRIS Status...' : 'Mengecek Status QRIS...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Verify QRIS Payment' : 'Cek Status Pembayaran QRIS'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
