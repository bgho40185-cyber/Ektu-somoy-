import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { loginAdminWithCredentials, ADMIN_EMAIL } from '../firebase';
import { User } from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setShowSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await loginAdminWithCredentials(email, password);
      setShowSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(false);
        onLoginSuccess(user);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Admin login error:', err);
      if (err.message && err.message.includes('Unauthorized')) {
        setError(`Only the authorized admin can access this panel.`);
      } else {
        setError(err.message || 'Incorrect email or password. Please check and try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="admin-login-modal"
        className="relative w-full max-w-md bg-[#0F1015] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-zinc-200"
      >
        {/* Top Gold Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-[#C29B6B] to-amber-400" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C29B6B]/15 border border-[#C29B6B]/30 flex items-center justify-center text-[#C29B6B]">
              <Lock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-medium tracking-wide text-white flex items-center gap-2">
                Admin Portal Login
              </h3>
              <p className="text-xs text-zinc-400">Ektu Shomoy Cafe Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {showSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Admin verified. Launching panel...</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-medium text-zinc-400">
              Admin Gmail / Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full pl-10 pr-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B] transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-medium text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C29B6B] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || showSuccess}
            className="w-full mt-2 py-3 rounded-xl bg-[#C29B6B] hover:bg-[#b58e5e] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#C29B6B]/15 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
