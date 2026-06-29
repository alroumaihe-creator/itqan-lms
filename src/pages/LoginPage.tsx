// ============================================================
// LOGIN PAGE - Etqan Academy (Premium UI)
// ============================================================

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // محاكاة الاتصال بالسيرفر
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await login(email, password);
      onLogin();
    } catch (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1B4F72 100%)' }}>
      
      {/* 🌟 تأثيرات الإضاءة الخلفية (Glowing Orbs) 🌟 */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#1B4F72] blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#F39C12] blur-[150px] opacity-20"></div>

      <div className="w-full max-w-md px-6 relative z-10 animate-slideUp">
        {/* 🌟 بطاقة تسجيل الدخول (Glassmorphism & Premium Card) 🌟 */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-10">
          
          <div className="text-center mb-8">
            {/* الشعار الجديد */}
            <div className="mb-6 relative inline-block">
              <img 
                src="/etqan-logo.png" 
                alt="أكاديمية إتقان" 
                className="w-36 h-auto mx-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // في حال لم يجد الصورة، يضع مربعاً بديلاً مؤقتاً
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Logo';
                }}
              />
            </div>
            <h1 className="text-3xl font-black text-[#1B4F72] mb-2 tracking-tight">أكاديمية إتقان</h1>
            <p className="text-[#F39C12] font-bold text-sm tracking-wide">علمٌ يُتْقَن.. أثَرٌ يَبقى</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 flex items-center gap-2 border border-red-100 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1B4F72] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 text-gray-800 rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-[#1B4F72] focus:bg-white transition-all text-sm font-medium"
                  placeholder="name@etqan.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1B4F72] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 text-gray-800 rounded-xl pr-12 pl-12 py-3.5 focus:outline-none focus:border-[#1B4F72] focus:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-[#1B4F72] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1B4F72] focus:ring-[#1B4F72] transition-colors" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">تذكرني</span>
              </label>
              <a href="#" className="text-sm font-bold text-[#F39C12] hover:text-[#D68910] transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-[#1B4F72] to-[#2E86AB] hover:from-[#153A54] hover:to-[#1B4F72] text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft size={20} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 font-medium">
              © {new Date().getFullYear()} أكاديمية إتقان - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};