import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertTriangle, Info, Zap, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, t } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          cyber: <Zap className="w-5 h-5 text-rose-400 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-500/30 bg-[#0c1615]/95',
          error: 'border-rose-500/30 bg-[#170a0f]/95',
          info: 'border-sky-500/30 bg-[#0a121e]/95',
          cyber: 'border-rose-500/40 bg-[#120914]/95 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-right-5 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {toast.title}
              </h5>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              aria-label={t.toasts.closeAria}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
