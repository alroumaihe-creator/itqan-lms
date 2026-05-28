// ============================================================
// CERTIFICATES PAGE
// ============================================================

import React, { useState } from 'react';
import { Award, Plus, Download, Eye, CheckCircle, Search } from 'lucide-react';
import { mockCertificates } from '../data/mockData';
import { Avatar } from '../components/shared/Avatar';
import { formatDateAr, CERTIFICATE_TYPE_LABELS } from '../utils/formatters';

export const CertificatesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = mockCertificates.filter(
    (c) =>
      !search ||
      c.titleAr.includes(search) ||
      c.student?.nameAr.includes(search) ||
      c.verificationCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الشهادات</h1>
          <p className="text-gray-400 text-sm">{mockCertificates.length} شهادة صادرة</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">إصدار شهادة</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="بحث بالاسم أو رمز التحقق..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pr-9"
        />
      </div>

      {/* Certificates Grid */}
      <div className="grid-cards">
        {filtered.map((cert) => (
          <div key={cert.id} className="certificate-preview">
            {/* Certificate Card */}
            <div
              className="card p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setShowPreview(cert.id)}
            >
              {/* Certificate Preview Header */}
              <div className="bg-gradient-to-l from-[#F39C12] to-[#F1C40F] p-4 text-center">
                <Award size={32} className="text-white mx-auto mb-1" />
                <p className="text-white/90 text-xs font-medium">أكاديمية النور</p>
              </div>

              <div className="p-5 text-center">
                <h3 className="font-bold text-gray-800 mb-1">{cert.titleAr}</h3>
                {cert.titleEn && (
                  <p className="text-xs text-gray-400 mb-2">{cert.titleEn}</p>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                  {CERTIFICATE_TYPE_LABELS[cert.type]}
                </span>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
                  <Avatar name={cert.student?.nameAr || 'طالب'} size="sm" />
                  <div className="text-right flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{cert.student?.nameAr}</p>
                    <p className="text-xs text-gray-400">{formatDateAr(cert.issueDate)}</p>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-400 mb-0.5">رمز التحقق</p>
                  <p className="font-mono text-xs font-bold text-[#1B4F72]">{cert.verificationCode}</p>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowPreview(cert.id); }}
                    className="btn btn-ghost btn-sm flex-1 gap-1"
                  >
                    <Eye size={13} />
                    عرض
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-primary btn-sm flex-1 gap-1"
                  >
                    <Download size={13} />
                    تحميل
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Award size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">لا توجد شهادات</p>
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {showPreview && (
        <CertificatePreviewModal
          cert={mockCertificates.find((c) => c.id === showPreview)!}
          onClose={() => setShowPreview(null)}
        />
      )}

      {/* Issue Certificate Modal */}
      {showModal && <IssueCertModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

const CertificatePreviewModal: React.FC<{
  cert: typeof mockCertificates[0];
  onClose: () => void;
}> = ({ cert, onClose }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={{ maxWidth: 600 }}>
      <div className="modal-header">
        <h2 className="text-lg font-bold">معاينة الشهادة</h2>
        <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
      </div>
      <div className="modal-body">
        {/* Certificate Design */}
        <div className="certificate mx-auto max-w-lg">
          <div className="relative z-10">
            <Award size={48} className="mx-auto mb-3 text-[#F39C12]" />
            <p className="text-[#1B4F72] font-bold text-lg mb-1">أكاديمية النور</p>
            <p className="text-gray-400 text-sm mb-5">للقرآن الكريم والتعليم الإسلامي</p>
            
            <div className="text-2xl font-black text-[#1B4F72] mb-2">{cert.titleAr}</div>
            {cert.titleEn && <p className="text-gray-500 text-sm mb-5">{cert.titleEn}</p>}
            
            <p className="text-gray-500 text-sm mb-2">يُشهد بأن</p>
            <p className="text-2xl font-black text-gray-800 mb-2">{cert.student?.nameAr}</p>
            <p className="text-gray-500 text-sm mb-5">قد أتم/أتمت بنجاح متطلبات</p>
            <p className="text-xl font-bold text-[#F39C12] mb-5">{cert.titleAr}</p>
            
            <p className="text-gray-400 text-sm mb-5">
              صدر في {formatDateAr(cert.issueDate)}
            </p>

            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <p className="text-xs text-gray-400 font-mono">{cert.verificationCode}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-ghost">إغلاق</button>
        <button className="btn btn-primary gap-1">
          <Download size={15} />
          تحميل PDF
        </button>
      </div>
    </div>
  </div>
);

import { mockStudents, mockCourses } from '../data/mockData';
import type { CertificateType } from '../types';

const IssueCertModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={{ maxWidth: 520 }}>
      <div className="modal-header">
        <h2 className="text-lg font-bold">إصدار شهادة جديدة</h2>
        <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
      </div>
      <div className="modal-body space-y-4">
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
          <label className="form-label required">نوع الشهادة</label>
          <select className="form-input form-select">
            {Object.entries(CERTIFICATE_TYPE_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label required">عنوان الشهادة بالعربي</label>
          <input type="text" className="form-input" placeholder="شهادة حفظ القرآن الكريم" />
        </div>
        <div className="form-group">
          <label className="form-label">عنوان الشهادة بالإنجليزي</label>
          <input type="text" className="form-input" placeholder="Quran Memorization Certificate" dir="ltr" />
        </div>
        <div className="form-group">
          <label className="form-label">الدورة المرتبطة</label>
          <select className="form-input form-select">
            <option value="">اختياري...</option>
            {mockCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">تاريخ الإصدار</label>
          <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
        <button onClick={onClose} className="btn btn-primary gap-1">
          <Award size={15} />
          إصدار الشهادة
        </button>
      </div>
    </div>
  </div>
);
