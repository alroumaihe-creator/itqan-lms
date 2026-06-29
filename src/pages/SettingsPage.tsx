// ============================================================
// SETTINGS PAGE - Connected to LocalStorage (System Config)
// ============================================================

import React, { useState } from 'react';
import {
  Settings, User, Bell, Shield, Globe, Palette,
  Database, Mail, MessageSquare, Save, Eye, EyeOff
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from '../components/shared/Avatar';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'system';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('system'); // جعلنا النظام هو الافتراضي
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  // حالة إعدادات النظام الديناميكية
  const [academyName, setAcademyName] = useState(localStorage.getItem('academyName') || 'أكاديمية الإتقان');
  const [academyLogo, setAcademyLogo] = useState(localStorage.getItem('academyLogo') || 'إ');

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveSystemSettings = () => {
    localStorage.setItem('academyName', academyName);
    localStorage.setItem('academyLogo', academyLogo);
    setSaved(true);
    
    // عمل تحديث للصفحة لتطبيق الاسم الجديد في القائمة الجانبية
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); 
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-gray-800">الإعدادات</h1>
        <p className="text-gray-400 text-sm">إدارة إعدادات الحساب والنظام</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar Tabs */}
        <div className="md:w-52 flex-shrink-0">
          <div className="card p-2">
            {[
              { id: 'system', label: 'النظام', icon: Settings },
              { id: 'profile', label: 'الملف الشخصي', icon: User },
              { id: 'notifications', label: 'الإشعارات', icon: Bell },
              { id: 'security', label: 'الأمان', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right text-sm font-medium transition-all mb-0.5 ${
                    activeTab === tab.id
                      ? 'bg-[#1B4F72] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-4">إعدادات النظام والأكاديمية</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label font-bold text-[#1B4F72]">اسم الأكاديمية</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={academyName} 
                    onChange={(e) => setAcademyName(e.target.value)} 
                  />
                  <p className="text-xs text-gray-400 mt-1">يظهر في القائمة الجانبية والفواتير.</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label font-bold text-[#1B4F72]">حرف الشعار (Logo Letter)</label>
                  <input 
                    type="text" 
                    maxLength={1} 
                    className="form-input" 
                    value={academyLogo} 
                    onChange={(e) => setAcademyLogo(e.target.value)} 
                  />
                  <p className="text-xs text-gray-400 mt-1">حرف واحد يعبر عن شعار الأكاديمية.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">العملة الافتراضية</label>
                  <select className="form-input form-select">
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">بادئة رقم الفاتورة (للتسلسل المستقبلي)</label>
                  <input type="text" className="form-input" defaultValue="INV" dir="ltr" />
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                <h4 className="font-semibold text-gray-700">إعدادات المزامنة المتقدمة</h4>
                {[
                  { label: 'تفعيل الجلسات المتكررة (Recurring Sessions)', checked: true },
                  { label: 'سجل التدقيق الداخلي (Audit Log)', checked: true },
                ].map((setting) => (
                  <label key={setting.label} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-600">{setting.label}</span>
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        setting.checked ? 'bg-[#1B4F72]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          setting.checked ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </label>
                ))}
              </div>

              <button onClick={handleSaveSystemSettings} className={`btn btn-primary gap-2 ${saved ? 'bg-green-600' : ''}`}>
                <Save size={16} />
                {saved ? 'جاري تطبيق التغييرات...' : 'حفظ إعدادات النظام'}
              </button>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">معلوماتي الشخصية</h2>

              <div className="flex items-center gap-4">
                <Avatar name={user?.nameAr || ''} size="xl" />
                <div>
                  <button className="btn btn-ghost btn-sm mb-1">تغيير الصورة</button>
                  <p className="text-xs text-gray-400">JPG, PNG (حتى 5MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">الاسم بالعربي</label>
                  <input type="text" className="form-input" defaultValue={user?.nameAr} />
                </div>
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
                  <input type="email" className="form-input" defaultValue={user?.email} dir="ltr" disabled />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">المنطقة الزمنية</label>
                <select className="form-input form-select">
                  <option>Asia/Riyadh (GMT+3)</option>
                  <option>Africa/Cairo (GMT+2)</option>
                </select>
              </div>

              <button onClick={handleSaveProfile} className={`btn btn-primary gap-2 ${saved ? 'btn-success' : ''}`}>
                <Save size={16} />
                {saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">إعدادات الإشعارات</h2>
              <div className="p-8 text-center text-gray-400">تحت التطوير</div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">الأمان وكلمة المرور</h2>

              <div className="form-group">
                <label className="form-label">كلمة المرور الحالية</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="form-input pl-10" placeholder="••••••••" dir="ltr" />
                  <button onClick={() => setShowPassword((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">كلمة المرور الجديدة</label>
                <input type="password" className="form-input" placeholder="8 أحرف على الأقل" dir="ltr" />
              </div>

              <button onClick={handleSaveProfile} className="btn btn-primary gap-2"><Shield size={16} />تحديث كلمة المرور</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};