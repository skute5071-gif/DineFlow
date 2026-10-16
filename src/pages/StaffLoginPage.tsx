import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useTable } from '../context/TableContext';
import { ExactMaharajaLogo } from '../components/common/Logo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  UtensilsCrossed,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant } = useTable();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick fill helper for review/testing
  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Maharaja@2026');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Front-end validation
    if (!email.trim()) {
      setErrorMessage('Please enter your staff email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your staff password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiService.login(email.trim(), password);
      setSuccessMessage(`Login successful! Redirecting to ${res.user.restaurantName} dashboard...`);

      // Determine redirect destination
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 700);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F3EDE2]">
      <div className="max-w-md w-full space-y-6">
        {/* Back to Customer Menu */}
        <div className="flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7D151B] hover:text-[#5c0e13] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customer Menu</span>
          </Link>
          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
            DineFlow v2.4 · Internal
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#EDE5D5] p-7 sm:p-9 relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7D151B] via-[#CBA24B] to-[#7D151B]" />

          {/* Restaurant Branding & Logo */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center">
              <div className="p-3 bg-[#FAF1F1] rounded-2xl border border-[#7D151B]/20 shadow-xs inline-block">
                <ExactMaharajaLogo size="md" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF1F1] border border-[#7D151B]/20 text-[11px] font-bold text-[#7D151B] tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Authorized Staff Portal</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-black text-stone-900 tracking-tight">
                Staff Login
              </h1>
              <p className="mt-1 text-xs text-stone-500">
                Sign in to manage live table orders, verify cash payments, and manage QR table stands for{' '}
                <span className="font-bold text-[#7D151B]">{restaurant.name}</span>.
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="leading-relaxed font-bold">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5" htmlFor="staff-email">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="name@vegmaharaja.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7D151B] focus:border-transparent text-sm bg-[#FAF8F5] transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700" htmlFor="staff-password">
                  Password
                </label>
                <span className="text-[11px] text-stone-400">Role-based access</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7D151B] focus:border-transparent text-sm bg-[#FAF8F5] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#7D151B] hover:bg-[#641015] active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#F3D99A]" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Quick-Login Presets (convenient for college demo presentation) */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#CBA24B]" />
                Demo Credentials (Click to auto-fill)
              </span>
              <span className="text-[10px] text-stone-400">PW: Maharaja@2026</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillCredentials('manager@vegmaharaja.com')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-[#7D151B] hover:bg-[#FAF1F1] transition-all text-left cursor-pointer group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#7D151B]">
                  Manager
                </div>
                <div className="text-[10px] text-stone-500 truncate">manager@vegmaharaja.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('cashier@vegmaharaja.com')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-[#7D151B] hover:bg-[#FAF1F1] transition-all text-left cursor-pointer group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#7D151B]">
                  Cashier Desk
                </div>
                <div className="text-[10px] text-stone-500 truncate">cashier@vegmaharaja.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff@vegmaharaja.com')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-[#7D151B] hover:bg-[#FAF1F1] transition-all text-left cursor-pointer group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#7D151B]">
                  Floor Captain
                </div>
                <div className="text-[10px] text-stone-500 truncate">staff@vegmaharaja.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('owner@vegmaharaja.com')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-[#7D151B] hover:bg-[#FAF1F1] transition-all text-left cursor-pointer group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#7D151B]">
                  Owner
                </div>
                <div className="text-[10px] text-stone-500 truncate">owner@vegmaharaja.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="text-center text-xs text-stone-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Protected by JWT RFC 7519 & Salted PBKDF2 Server Hashing</span>
          </p>
          <p className="text-[11px] text-stone-400">
            Staff registration is restricted to authorized restaurant owners & administrators.
          </p>
        </div>
      </div>
    </div>
  );
};
