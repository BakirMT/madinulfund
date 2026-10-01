import React, { useState } from 'react';
import { Landmark, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDars } from '../../context/DarsContext';

interface LoginProps {
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ showToast }) => {
  const { login } = useAuth();
  const { settings } = useDars();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = login(username, password);
    if (res.success) {
      showToast('success', 'Welcome Administrator', `Signed in to ${settings.dars_name} Student Fund.`);
    } else {
      setError(res.error || 'Authentication failed. Please verify username and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-slate-100 select-none">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Institutional Crest & Brand */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
            <Landmark className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {settings.dars_name || 'Madinul Qutaba'}
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-emerald-400 font-extrabold mt-1">
              DARS Student Fund Management System
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Authorized Administrator & In-Charge Portal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-800 p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Authentication</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">Secure</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Username */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] sm:text-xs mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] sm:text-xs mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full min-h-[48px] pl-10 pr-11 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full min-h-[50px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          <span>{settings.dars_name}</span> · <span>Protected Islamic Educational Fund Accounting</span>
        </div>
      </div>
    </div>
  );
};
