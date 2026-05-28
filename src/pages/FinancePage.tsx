// ============================================================
// FINANCE PAGE - Invoices, Payments, Subscriptions
// ============================================================

import React, { useState } from 'react';
import {
  DollarSign, FileText, CreditCard, TrendingUp, AlertTriangle,
  Plus, Eye, Send, Download, RefreshCw, CheckCircle, Scroll
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  mockInvoices, mockSubscriptions, mockRevenueData, mockDashboardStats
} from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { formatCurrency, formatDateAr, PAYMENT_METHOD_LABELS } from '../utils/formatters';

type FinanceTab = 'dashboard' | 'invoices' | 'payments' | 'subscriptions';

export const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const totalRevenue = mockInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((s, i) => s + i.total, 0);
  const totalPending = mockInvoices
    .filter((i) => ['SENT', 'DRAFT'].includes(i.status))
    .reduce((s, i) => s + i.total, 0);
  const totalOverdue = mockInvoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((s, i) => s + i.total, 0);

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
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FinanceTab)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={15} />
              {tab.label}
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
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-green-600">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">هذه السنة</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">الإيراد الشهري</p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600">{formatCurrency(mockDashboardStats.monthlyRevenue)}</p>
              <p className="text-xs text-green-500 mt-1">↑ 12% من الشهر الماضي</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#2E86AB' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">مستحق</p>
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText size={16} className="text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-gray-400 mt-1">{mockInvoices.filter(i => ['SENT','DRAFT'].includes(i.status)).length} فاتورة</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#E74C3C' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">متأخر</p>
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-red-600">{formatCurrency(totalOverdue)}</p>
              <p className="text-xs text-gray-400 mt-1">{mockInvoices.filter(i => i.status === 'OVERDUE').length} فاتورة</p>
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
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#27AE60"
                    strokeWidth={2.5}
                    fill="url(#finRevGrad)"
                    name="الإيراد"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alert: Overdue */}
          {mockInvoices.some((i) => i.status === 'OVERDUE') && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                <h3 className="font-bold text-red-700">فواتير متأخرة تحتاج إلى متابعة</h3>
              </div>
              {mockInvoices.filter((i) => i.status === 'OVERDUE').map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 bg-white rounded-xl p-3 mb-2">
                  <Avatar name={inv.student?.nameAr || 'طالب'} size="sm" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{inv.student?.nameAr}</p>
                    <p className="text-xs text-gray-400">{inv.invoiceNumber}</p>
                  </div>
                  <p className="font-black text-red-600">{formatCurrency(inv.total, inv.currency)}</p>
                  <button className="btn btn-sm btn-danger gap-1">
                    <Send size={13} />
                    تذكير
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">جميع الفواتير</h3>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm gap-1">
                  <Download size={14} />
                  تصدير
                </button>
                <button onClick={() => setShowInvoiceModal(true)} className="btn btn-primary btn-sm gap-1">
                  <Plus size={14} />
                  فاتورة
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>الطالب</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-mono font-bold text-[#1B4F72] text-sm">
                        {invoice.invoiceNumber}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={invoice.student?.nameAr || 'طالب'} size="xs" />
                          <span className="text-sm font-medium">{invoice.student?.nameAr}</span>
                        </div>
                      </td>
                      <td className="font-bold">
                        {formatCurrency(invoice.total, invoice.currency)}
                        {invoice.discount > 0 && (
                          <span className="text-xs text-green-500 block">خصم: {formatCurrency(invoice.discount)}</span>
                        )}
                      </td>
                      <td><StatusBadge status={invoice.status} /></td>
                      <td className="text-sm text-gray-500">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString('ar-SA')
                          : '—'}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-icon btn-ghost btn-sm">
                            <Eye size={14} />
                          </button>
                          {invoice.status === 'DRAFT' && (
                            <button className="btn btn-sm btn-secondary gap-1">
                              <Send size={13} />
                              إرسال
                            </button>
                          )}
                          {invoice.status === 'SENT' && (
                            <button className="btn btn-sm btn-success gap-1">
                              <CheckCircle size={13} />
                              تسجيل دفعة
                            </button>
                          )}
                          <button className="btn btn-icon btn-ghost btn-sm">
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">المدفوعات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>الفاتورة</th>
                  <th>المبلغ</th>
                  <th>طريقة الدفع</th>
                  <th>الحالة</th>
                  <th>تاريخ الدفع</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.flatMap((inv) =>
                  (inv.payments || []).map((pay) => (
                    <tr key={pay.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={inv.student?.nameAr || 'طالب'} size="xs" />
                          <span className="text-sm">{inv.student?.nameAr}</span>
                        </div>
                      </td>
                      <td className="font-mono text-sm text-[#1B4F72]">{inv.invoiceNumber}</td>
                      <td className="font-bold text-green-600">{formatCurrency(pay.amount, pay.currency)}</td>
                      <td className="text-sm text-gray-500">
                        {pay.method ? PAYMENT_METHOD_LABELS[pay.method] || pay.method : '—'}
                      </td>
                      <td><StatusBadge status={pay.status} /></td>
                      <td className="text-sm text-gray-500">
                        {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('ar-SA') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="grid-cards animate-fadeIn">
          {mockSubscriptions.map((sub) => {
            const student = mockStudents.find((s) => s.id === sub.studentId);
            const usedPercent = sub.sessionsTotal
              ? (sub.sessionsUsed / sub.sessionsTotal) * 100
              : 0;
            return (
              <div key={sub.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={student?.nameAr || 'طالب'} size="md" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{student?.nameAr}</p>
                    <p className="text-xs text-[#F39C12] font-semibold">{sub.packageName}</p>
                  </div>
                  <span
                    className={`mr-auto text-xs font-bold px-2 py-1 rounded-full ${
                      sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {sub.isActive ? 'نشط' : 'منتهي'}
                  </span>
                </div>

                {sub.sessionsTotal && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>الجلسات المستخدمة</span>
                      <span>{sub.sessionsUsed}/{sub.sessionsTotal}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill bg-gradient-to-l from-[#F39C12] to-[#1B4F72]"
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">الرسوم الشهرية</p>
                    <p className="font-bold text-[#1B4F72]">
                      {sub.monthlyFee ? formatCurrency(sub.monthlyFee) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">تاريخ البداية</p>
                    <p className="font-semibold text-gray-700">
                      {formatDateAr(sub.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="btn btn-ghost btn-sm flex-1 gap-1">
                    <RefreshCw size={13} />
                    تجديد
                  </button>
                  <button className="btn btn-primary btn-sm flex-1">تفاصيل</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Create Modal */}
      {showInvoiceModal && (
        <InvoiceFormModal onClose={() => setShowInvoiceModal(false)} />
      )}
    </div>
  );
};

// ─── Invoice Form Modal ────────────────────────────────────
import { mockStudents } from '../data/mockData';

const InvoiceFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
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

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText size={20} className="text-[#1B4F72]" />
            إنشاء فاتورة جديدة
          </h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الطالب</label>
              <select className="form-input form-select">
                <option value="">اختر طالباً...</option>
                {mockStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">تاريخ الاستحقاق</label>
              <input type="date" className="form-input" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">البنود</label>
              <button onClick={addItem} className="btn btn-ghost btn-sm gap-1">
                <Plus size={13} />
                إضافة بند
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5 form-group mb-0">
                    {idx === 0 && <label className="form-label text-xs">الوصف</label>}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="وصف الخدمة"
                      className="form-input text-sm"
                    />
                  </div>
                  <div className="col-span-2 form-group mb-0">
                    {idx === 0 && <label className="form-label text-xs">الكمية</label>}
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="form-input text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-2 form-group mb-0">
                    {idx === 0 && <label className="form-label text-xs">السعر</label>}
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                      className="form-input text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-3 form-group mb-0">
                    {idx === 0 && <label className="form-label text-xs">الإجمالي</label>}
                    <div className="form-input text-sm font-bold text-[#1B4F72] bg-gray-50">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الخصم ($)</span>
              <input type="number" className="form-input w-24 text-sm text-left py-1" defaultValue={0} dir="ltr" />
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
              <span>الإجمالي</span>
              <span className="text-[#1B4F72]">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea rows={2} className="form-input resize-none text-sm" placeholder="أي ملاحظات للفاتورة..." />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
          <button onClick={onClose} className="btn btn-ghost gap-1">
            <FileText size={14} />
            حفظ مسودة
          </button>
          <button onClick={onClose} className="btn btn-primary gap-1">
            <Send size={14} />
            إرسال للطالب
          </button>
        </div>
      </div>
    </div>
  );
};
