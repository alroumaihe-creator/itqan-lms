// ============================================================
// RECEIPT PRINT VIEW - Printable Beautiful Invoice
// ============================================================

import React from 'react';

interface ReceiptPrintProps {
  invoice: any; // بيانات الفاتورة المحددة
  academyName: string;
  academyLogo: string;
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ invoice, academyName, academyLogo }) => {
  if (!invoice) return null;

  // تواريخ افتراضية للاشتراك (من تاريخ الإصدار وحتى الاستحقاق أو شهر للأمام)
  const startDate = new Date(invoice.issueDate || Date.now());
  const endDate = new Date(invoice.dueDate || new Date(startDate).setMonth(startDate.getMonth() + 1));

  return (
    <div className="print-receipt-container" dir="rtl">
      {/* ستايل مخصص للطباعة فقط */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-receipt-container, .print-receipt-container * {
              visibility: visible;
            }
            .print-receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: #fff;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            /* إخفاء القوائم والأزرار وقت الطباعة */
            .sidebar, .header, .tabs, .modal, .btn { display: none !important; }
            
            /* تنسيق الألوان الفاخرة للطباعة */
            .r-header { background: linear-gradient(135deg, #1B4F72 0%, #27AE60 100%) !important; color: white !important; }
            .r-logo { background: #F39C12 !important; color: white !important; }
            .r-badge { background: rgba(255,255,255,0.15) !important; border: 1px solid rgba(255,255,255,0.2) !important; }
            .r-period { background: #E8F4F8 !important; border: 1px dashed #2E86AB !important; }
          }
        `}
      </style>

      {/* ترويسة الإيصال الفاخرة */}
      <div className="r-header rounded-3xl p-8 mb-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-5">
          <div className="r-logo w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-md">
            {academyLogo}
          </div>
          <div>
            <h1 className="text-2xl font-black mb-1">{academyName}</h1>
            <p className="text-sm opacity-80">لعلوم القرآن الكريم والتعليم الأكاديمي المتقدم</p>
          </div>
        </div>
        <div className="r-badge p-4 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-1">إيصال سداد إلكتروني</h2>
          <p className="font-mono text-sm font-bold text-[#F39C12]">INV-{invoice.id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      {/* البيانات العامة */}
      <div className="flex justify-between items-center mb-8 px-4 text-sm font-bold">
        <div className="flex gap-2"><span className="text-gray-500">تاريخ الإصدار:</span> <span>{startDate.toLocaleDateString('ar-SA')}</span></div>
        <div className="flex gap-2"><span className="text-gray-500">العملة:</span> <span>الدولار الأمريكي ($)</span></div>
        <div className="flex gap-2"><span className="text-gray-500">حالة الإيصال:</span> <span className="text-green-600">✓ مدفوع ومكتمل</span></div>
      </div>

      {/* بيانات الأطراف (الدارس والمعلم) */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-[#1B4F72] font-black border-b border-gray-100 pb-3 mb-4">بيانات الأطراف التعليمية</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">اسم الدارس / الطالب:</p>
            <p className="font-bold text-gray-800 text-lg">{invoice.student?.nameAr || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">المعلم / المشرف الأكاديمي:</p>
            <p className="font-bold text-gray-800 text-lg">{invoice.teacherName || 'الشيخ طارق عاطف' /* يمكن جلبها من علاقة الطالب */}</p>
          </div>
        </div>
      </div>

      {/* فترة الاشتراك */}
      <div className="r-period p-5 mb-6 text-center">
        <p className="text-[#1B4F72] font-bold mb-3">فترة صلاحية الاشتراك والمسار التدريبي</p>
        <div className="flex justify-around items-center font-bold">
          <div>
            <p className="text-xs text-gray-500 mb-1">بداية الاشتراك</p>
            <p className="text-lg">{startDate.toLocaleDateString('ar-SA')}</p>
          </div>
          <div className="text-gray-400">◄◄◄</div>
          <div>
            <p className="text-xs text-gray-500 mb-1">نهاية الصلاحية</p>
            <p className="text-lg">{endDate.toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      </div>

      {/* التفاصيل المالية */}
      <table className="w-full mb-8 text-sm">
        <thead className="bg-gray-50 text-[#1B4F72]">
          <tr>
            <th className="p-4 text-right rounded-r-xl">البيان / الخدمة الأكاديمية</th>
            <th className="p-4 text-center">الكمية</th>
            <th className="p-4 text-left rounded-l-xl">الإجمالي ($)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="p-4 font-bold">{invoice.notes || 'رسوم الاشتراك الأكاديمي'}</td>
            <td className="p-4 text-center text-gray-500">1</td>
            <td className="p-4 text-left font-black text-lg">${invoice.amount?.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* الختم والتوقيع */}
      <div className="flex justify-between items-end mt-12 px-4 border-t border-gray-100 pt-8">
        <div className="text-xs text-gray-500 leading-relaxed max-w-sm">
          <p className="font-bold text-gray-800 mb-2">ملاحظات هامة:</p>
          • يعتبر هذا الإيصال مستنداً رسمياً يثبت سداد الرسوم.<br/>
          • يتم تفعيل صلاحية الدخول للمنصة طوال فترة الاشتراك.
        </div>
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold rotate-[-15deg]">
          ختم الأكاديمية
        </div>
      </div>
    </div>
  );
};