// ============================================================
// LIBRARY PAGE
// ============================================================

import React, { useState } from 'react';
import {
  Library, Plus, Search, Filter, Download, ExternalLink,
  FileText, Volume2, Video, Image, Link2, BookOpen
} from 'lucide-react';
import { mockLibraryItems } from '../data/mockData';
import { formatFileSize } from '../utils/formatters';
import type { LibraryItem } from '../types';

const TYPE_CONFIG: Record<string, { icon: React.FC<{ size?: number; className?: string }>, color: string, label: string }> = {
  pdf: { icon: FileText, color: '#E74C3C', label: 'PDF' },
  audio: { icon: Volume2, color: '#2E86AB', label: 'صوت' },
  video: { icon: Video, color: '#9B59B6', label: 'فيديو' },
  image: { icon: Image, color: '#27AE60', label: 'صورة' },
  link: { icon: Link2, color: '#F39C12', label: 'رابط' },
  worksheet: { icon: BookOpen, color: '#1B4F72', label: 'ورقة عمل' },
};

export const LibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filtered = mockLibraryItems.filter((item) => {
    const matchSearch = !search || item.titleAr.includes(search) || item.description?.includes(search);
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">المكتبة</h1>
          <p className="text-gray-400 text-sm">{mockLibraryItems.length} ملف</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">رفع ملف</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المكتبة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pr-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter('all')}
            className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            الكل
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`btn btn-sm gap-1 ${typeFilter === key ? 'btn-primary' : 'btn-ghost'}`}
            >
              {key === 'pdf' ? <FileText size={13} /> : key === 'audio' ? <Volume2 size={13} /> : <Video size={13} />}
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid-cards">
        {filtered.map((item) => (
          <LibraryItemCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Library size={48} className="mx-auto mb-3 text-gray-200" />
            <p>لا توجد ملفات</p>
          </div>
        )}
      </div>

      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
};

const LibraryItemCard: React.FC<{ item: LibraryItem }> = ({ item }) => {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG['link'];
  const Icon = config.icon;

  return (
    <div className="card p-4 card-interactive">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <span style={{ color: config.color }}><Icon size={22} /></span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{item.titleAr}</h3>
          {item.titleEn && <p className="text-xs text-gray-400 mb-1">{item.titleEn}</p>}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {item.fileSize && <span>{formatFileSize(item.fileSize)}</span>}
          {item.course && (
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
              {item.course.nameAr}
            </span>
          )}
          {item.isPublic && (
            <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[11px] font-semibold">
              عام
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {item.fileUrl && (
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-ghost btn-icon btn-sm">
                <Download size={14} />
              </button>
            </a>
          )}
          {item.externalUrl && (
            <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-ghost btn-icon btn-sm">
                <ExternalLink size={14} />
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const UploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">رفع ملف جديد</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <div className="modal-body space-y-4">
          {/* Upload Area */}
          <div
            className={`upload-area ${dragOver ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
          >
            <Plus size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-500 mb-1">اسحب الملف هنا أو انقر للاختيار</p>
            <p className="text-sm text-gray-400">PDF, MP3, MP4, JPG, PNG (حتى 50MB)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الاسم بالعربي</label>
              <input type="text" className="form-input" placeholder="عنوان الملف" />
            </div>
            <div className="form-group">
              <label className="form-label">النوع</label>
              <select className="form-input form-select">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">الوصف</label>
            <textarea rows={2} className="form-input resize-none text-sm" placeholder="وصف الملف..." />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublic" className="w-4 h-4 rounded" />
            <label htmlFor="isPublic" className="text-sm text-gray-600 cursor-pointer">
              ملف عام (يمكن لجميع الطلاب الوصول إليه)
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
          <button onClick={onClose} className="btn btn-primary gap-1">
            <Plus size={14} />
            رفع الملف
          </button>
        </div>
      </div>
    </div>
  );
};
