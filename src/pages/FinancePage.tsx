// ============================================================
// FINANCE PAGE - Smart Invoicing & Payments (Connected to API)
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  DollarSign, FileText, CreditCard, TrendingUp, AlertTriangle,
  Plus, Eye, Send, Download, RefreshCw, CheckCircle, Scroll, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { mockSubscriptions, mockRevenueData, mockDashboardStats } from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { formatCurrency, formatDateAr, PAYMENT_METHOD_LABELS } from '../utils/formatters';

type FinanceTab = 'dashboard' | 'invoices' | 'payments' | 'subscriptions';

export const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // حالات البيانات الحقيقية من السيرفر
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/invoices`);
      if (response.ok) {
        setInvoices(await response.json());
      }
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalRevenue = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => ['UNPAID'].includes(i.status)).reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">المالية</h1>
          <p className="text-gray-400 text-sm">إدارة الفواتير والمدفوعات والاشتراكات</p>
        </div>
        <button onClick={() => setShowInvoiceModal(true)} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">فاتورة جديدة</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs bg-white rounded-xl border border-gray-100 px-2">
        {[
          { id: 'dashboard', label: 'لوحة التحكم', icon: TrendingUp },
          { id: 'invoices', label: 'الفواتير', icon: FileText },
          { id: 'payments', label: 'المدفوعات', icon: CreditCard },
          { id: 'subscriptions', label: 'الاشتراكات', icon: Scroll },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as FinanceTab)} className={`tab ${activeTab === tab.id ? 'active' : ''}`}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5 animate-fadeIn">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card" style={{ borderRightColor: '#27AE60' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">إجمالي المدفوع</p>
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle size={16} className="text-green-500" /></div>
              </div>
              <p className="text-2xl font-black text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">الإيراد الشهري</p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"><DollarSign size={16} className="text-amber-500" /></div>
              </div>
              <p className="text-2xl font-black text-amber-600">{formatCurrency(mockDashboardStats.monthlyRevenue)}</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#2E86AB' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">مستحق (غير مدفوع)</p>
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><FileText size={16} className="text-blue-500" /></div>
              </div>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(totalPending)}</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#E74C3C' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">متأخر</p>
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><AlertTriangle size={16} className="text-red-500" /></div>
              </div>
              <p className="text-2xl font-black text-red-600">{formatCurrency(totalOverdue)}</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">الإيرادات الشهرية</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27AE60" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#27AE60" strokeWidth={2.5} fill="url(#finRevGrad)" name="الإيراد" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">جميع الفواتير</h3>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-10 text-center text-gray-500">جاري تحميل الفواتير...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                      <th>تاريخ الاستحقاق</th>
                      <th>ملاحظات</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-gray-500">لا توجد فواتير بعد.</td></tr>
                    ) : (
                      invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <Avatar name={invoice.student?.nameAr || 'طالب'} size="xs" />
                              <span className="text-sm font-medium">{invoice.student?.nameAr}</span>
                            </div>
                          </td>
                          <td className="font-bold text-[#1B4F72]">{formatCurrency(invoice.amount)}</td>
                          <td><StatusBadge status={invoice.status} /></td>
                          <td className="text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</td>
                          <td className="text-xs text-gray-400 max-w-[150px] truncate">{invoice.notes || '—'}</td>
                          <td>
                            <div className="flex gap-1">
                              {invoice.status !== 'PAID' && (
                                <button className="btn btn-sm btn-success gap-1 text-xs px-2 py-1">
                                  <CheckCircle size={12} /> سداد
                                </button>
                              )}
                              <button className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="تنزيل PDF"><Download size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* باقي التبويبات (المدفوعات والاشتراكات) يمكن تركها على الداتا الوهمية حالياً لحين تفريغها */}
      {activeTab === 'subscriptions' && (
        <div className="card p-10 text-center text-gray-400">
           <Scroll size={40} className="mx-auto mb-3 opacity-50" />
           <p>نظام إدارة الاشتراكات التلقائية سيظهر هنا.</p>
        </div>
      )}
      {activeTab === 'payments' && (
        <div className="card p-10 text-center text-gray-400">
           <CreditCard size={40} className="mx-auto mb-3 opacity-50" />
           <p>سجل المدفوعات المفصل سيظهر هنا.</p>
        </div>
      )}

      {/* Invoice Create Modal */}
      {showInvoiceModal && <InvoiceFormModal onClose={() => setShowInvoiceModal(false)} onSave={fetchInvoices} />}
    </div>
  );
};

// ─── Smart Invoice Form Modal ────────────────────────────────────

const InvoiceFormModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  
  // البند التلقائي أو اليدوي للفاتورة
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);

  useEffect(() => {
    const fetchStudents = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const res = await fetch(`${apiUrl}/students`);
      if (res.ok) setRealStudents(await res.json());
    };
    fetchStudents();
    
    // تعيين تاريخ الاستحقاق الافتراضي ليكون بعد أسبوع
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  // الدالة السحرية: عندما تختار طالباً، اجلب سعره المتفق عليه
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    
    const student = realStudents.find(s => s.id === sId);
    if (student && student.monthlyFee) {
      // ملء الفاتورة تلقائياً من التسكين الذكي
      setItems([{
        description: `اشتراك شهر - ${student.targetTrack || 'مسار الحفظ'} (باقة ${student.targetPackage || ''})`,
        quantity: 1,
        unitPrice: student.monthlyFee,
        total: student.monthlyFee
      }]);
    } else {
      // تفريغ الحقول إذا لم يكن للطالب تسكين مسبق
      setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  };

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated[idx].total = updated[idx].quantity * updated[idx].unitPrice;
      }
      return updated;
    });
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async () => {
    if (!selectedStudentId) return alert('يرجى اختيار طالب أولاً.');
    if (subtotal <= 0) return alert('يجب أن تكون قيمة الفاتورة أكبر من صفر.');
    
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          amount: subtotal,
          status: 'UNPAID',
          dueDate: dueDate,
          notes: items[0].description // نستخدم الوصف كملاحظة
        })
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert('حدث خطأ أثناء إصدار الفاتورة');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText size={20} className="text-[#1B4F72]" />
            إصدار فاتورة ذكية
          </h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><X size={20}/></button>
        </div>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الطالب</label>
              <select className="form-input form-select" value={selectedStudentId} onChange={handleStudentChange}>
                <option value="">اختر طالباً...</option>
                {realStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">تاريخ الاستحقاق</label>
              <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* البنود (يتم تعبئتها تلقائياً) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
            <p className="text-xs text-blue-800 font-bold mb-3 flex items-center gap-1">
              <TrendingUp size={14}/> سيتم جلب بيانات الباقة تلقائياً إذا كان للطالب تسكين مسبق.
            </p>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6 form-group mb-0">
                    <label className="form-label text-xs">الوصف / الباقة</label>
                    <input type="text" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="وصف الخدمة" className="form-input text-sm bg-white" />
                  </div>
                  <div className="col-span-3 form-group mb-0">
                    <label className="form-label text-xs">السعر ($)</label>
                    <input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} className="form-input text-sm bg-white font-bold text-[#1B4F72]" dir="ltr" />
                  </div>
                  <div className="col-span-3 form-group mb-0">
                    <label className="form-label text-xs">الإجمالي</label>
                    <div className="form-input text-sm font-bold text-green-700 bg-white border-green-200">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="modal-footer">
          <button onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary gap-1">
            <Send size={14} />
            {isLoading ? 'جاري الإصدار...' : 'إصدار الفاتورة'}
          </button>
        </div>
      </div>
    </div>
  );
};