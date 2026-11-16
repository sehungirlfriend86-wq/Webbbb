import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShieldCheck, Lock, User as UserIcon, Mail, Phone, MapPin, KeyRound, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
    language,
    t
  } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        await login(username, password);
      } else {
        await register({
          username,
          name,
          email,
          password,
          phone,
          address
        });
      }
      setIsAuthModalOpen(false);
      // Reset form
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
    } catch (err: any) {
      setErrorMsg(err.message || (authMode === 'login' ? t.auth.loginError : t.auth.registerError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdmin = () => {
    setUsername('admin');
    setPassword('admin1234');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0f111f] border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {authMode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {t.auth.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Discrete Admin Quick Fill */}
          {authMode === 'login' && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
              <span>{language === 'en' ? 'Admin Quick Fill:' : 'Bantuan Admin:'}</span>
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="text-red-400 hover:text-red-300 font-bold hover:underline transition-colors"
              >
                {language === 'en' ? 'Fill Official Admin Credentials ⚡' : 'Isi Kredensial Admin Resmi ⚡'}
              </button>
            </div>
          )}

          {/* Register-only fields */}
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  {t.auth.fullNameLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  {t.auth.emailLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="wota@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    {t.auth.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0812345678"
                      className="w-full pl-8 pr-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    {t.auth.addressLabel}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder={t.auth.addressPlaceholder}
                      className="w-full pl-8 pr-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              {t.auth.usernameLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t.auth.usernamePlaceholder}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              {t.auth.passwordLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Security Badge */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.auth.securityNote}</span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{t.auth.processing}</span>
            ) : authMode === 'login' ? (
              <span>{t.auth.loginBtn}</span>
            ) : (
              <span>{t.auth.registerBtn}</span>
            )}
          </button>

          {/* Toggle Login / Register */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
            {authMode === 'login' ? (
              <p>
                {t.auth.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-semibold"
                >
                  {t.auth.switchToRegister}
                </button>
              </p>
            ) : (
              <p>
                {t.auth.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-semibold"
                >
                  {t.auth.switchToLogin}
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
