// ============================================================
// LOGIN PAGE - Arabic First UI
// ============================================================

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, BookOpen } from 'lucide-react';
import { useAuthStore, TEST_ACCOUNTS } from '../stores/authStore';
import type { Role } from '../types';

const DEMO_ACCOUNTS = [
  { label: 'مدير عام', email: 'admin@academy.com', password: 'Admin@123', role: 'SUPER_ADMIN' as Role, color: '#1B4F72' },
  { label: 'معلم', email: 'teacher@academy.com', password: 'Teacher@123', role: 'TEACHER' as Role, color: '#27AE60' },
  { label: 'ولي أمر', email: 'parent@academy.com', password: 'Parent@123', role: 'PARENT' as Role, color: '#9B59B6' },
  { label: 'محاسب', email: 'accountant@academy.com', password: 'Account@123', role: 'ACCOUNTANT' as Role, color: '#E67E22' },
];

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { login, isLoading, setLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const account = TEST_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );

    if (account) {
      login(
        {
          id: account.id,
          email: account.email,
          role: account.role,
          nameAr: account.nameAr,
        },
        'mock-jwt-token-' + account.id
      );
      setLoading(false);
      onLogin();
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    }
  };

  const quickLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen login-bg islamic-pattern flex items-center justify-center p-4" dir="rtl">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#F39C12]/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 mx-auto">
            <BookOpen size={36} className="text-[#F39C12]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">أكاديمية النور</h1>
          <p className="text-white/60 text-sm">للقرآن الكريم والتعليم الإسلامي</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-bounceIn">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-1">مرحباً بك 👋</h2>
          <p className="text-gray-400 text-sm mb-6">قم بتسجيل الدخول للوصول إلى النظام</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 mb-5 animate-fadeIn">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-group">
              <label className="form-label required">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@academy.com"
                  className="form-input pr-10"
                  dir="ltr"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label required">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pr-10 pl-10"
                  dir="ltr"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#1B4F72] w-4 h-4"
                />
                <span className="text-sm text-gray-600">تذكرني</span>
              </label>
              <button type="button" className="text-sm text-[#1B4F72] hover:underline font-medium">
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3 font-medium">حسابات تجريبية سريعة</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => quickLogin(account)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-sm text-right"
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.label[0]}
                  </div>
                  <span className="text-gray-600 font-medium text-xs">{account.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          © 2024 أكاديمية النور - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};
