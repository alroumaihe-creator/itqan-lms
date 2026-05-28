// ============================================================
// SETTINGS PAGE
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              { id: 'profile', label: 'الملف الشخصي', icon: User },
              { id: 'notifications', label: 'الإشعارات', icon: Bell },
              { id: 'security', label: 'الأمان', icon: Shield },
              { id: 'system', label: 'النظام', icon: Settings },
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">معلوماتي الشخصية</h2>

              {/* Avatar */}
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
                  <label className="form-label">الاسم بالإنجليزي</label>
                  <input type="text" className="form-input" defaultValue={user?.nameEn || ''} dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
                  <input type="email" className="form-input" defaultValue={user?.email} dir="ltr" />
                </div>
                <div className="form-group">
                  <label className="form-label">رقم الهاتف</label>
                  <input type="tel" className="form-input" placeholder="+966 5X XXX XXXX" dir="ltr" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">المنطقة الزمنية</label>
                <select className="form-input form-select">
                  <option>Asia/Riyadh (GMT+3)</option>
                  <option>Africa/Cairo (GMT+2)</option>
                  <option>Asia/Dubai (GMT+4)</option>
                  <option>UTC (GMT+0)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">اللغة المفضلة</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="lang" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">العربية</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="lang" className="w-4 h-4" />
                    <span className="text-sm">English</span>
                  </label>
                </div>
              </div>

              <button onClick={handleSave} className={`btn btn-primary gap-2 ${saved ? 'btn-success' : ''}`}>
                <Save size={16} />
                {saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">إعدادات الإشعارات</h2>

              {[
                { label: 'إشعارات الجلسات', desc: 'تذكير قبل الجلسة بساعة', channel: 'sessions' },
                { label: 'إشعارات الحضور', desc: 'إشعار عند تسجيل الغياب', channel: 'attendance' },
                { label: 'إشعارات المالية', desc: 'فواتير مستحقة وتأخيرات', channel: 'finance' },
                { label: 'إشعارات الرسائل', desc: 'رسائل جديدة من المعلمين', channel: 'messages' },
                { label: 'تقارير أسبوعية', desc: 'ملخص أسبوعي للأكاديمية', channel: 'reports' },
              ].map((item) => (
                <div key={item.channel} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded" />
                      <Mail size={13} />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded" />
                      <MessageSquare size={13} />
                    </label>
                    <button className="w-11 h-6 rounded-full bg-[#1B4F72] relative">
                      <span className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={handleSave} className="btn btn-primary gap-2">
                <Save size={16} />
                {saved ? 'تم الحفظ!' : 'حفظ الإعدادات'}
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">الأمان وكلمة المرور</h2>

              <div className="form-group">
                <label className="form-label">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input pl-10"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">كلمة المرور الجديدة</label>
                <input type="password" className="form-input" placeholder="8 أحرف على الأقل" dir="ltr" />
              </div>

              <div className="form-group">
                <label className="form-label">تأكيد كلمة المرور</label>
                <input type="password" className="form-input" placeholder="أعد كتابة كلمة المرور" dir="ltr" />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <h4 className="font-semibold text-amber-700 text-sm mb-2">متطلبات كلمة المرور</h4>
                <ul className="text-xs text-amber-600 space-y-1">
                  <li>✓ 8 أحرف على الأقل</li>
                  <li>✓ حرف كبير وحرف صغير</li>
                  <li>✓ رقم واحد على الأقل</li>
                  <li>✓ رمز خاص (!@#$%)</li>
                </ul>
              </div>

              <button onClick={handleSave} className="btn btn-primary gap-2">
                <Shield size={16} />
                تحديث كلمة المرور
              </button>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="card p-6 space-y-5 animate-fadeIn">
              <h2 className="font-bold text-gray-800 text-lg">إعدادات النظام</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">اسم الأكاديمية</label>
                  <input type="text" className="form-input" defaultValue="أكاديمية النور" />
                </div>
                <div className="form-group">
                  <label className="form-label">العملة الافتراضية</label>
                  <select className="form-input form-select">
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">بادئة رقم الفاتورة</label>
                <input type="text" className="form-input" defaultValue="INV-2024" dir="ltr" />
              </div>

              <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-700">إعدادات إضافية</h4>
                {[
                  { label: 'تفعيل الجلسات المتكررة', checked: true },
                  { label: 'إشعارات الواتساب', checked: false },
                  { label: 'الحذف الناعم (احتفاظ بالبيانات)', checked: true },
                  { label: 'سجل التدقيق (Audit Log)', checked: true },
                ].map((setting) => (
                  <label key={setting.label} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-600">{setting.label}</span>
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        setting.checked ? 'bg-[#1B4F72]' : 'bg-gray-200'
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

              <button onClick={handleSave} className="btn btn-primary gap-2">
                <Save size={16} />
                {saved ? 'تم الحفظ!' : 'حفظ الإعدادات'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
