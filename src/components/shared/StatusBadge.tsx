// ============================================================
// STATUS BADGE COMPONENT
// ============================================================

import React from 'react';
import type { StudentStatus, SessionStatus, InvoiceStatus, PaymentStatus } from '../../types';

type BadgeVariant = StudentStatus | SessionStatus | InvoiceStatus | PaymentStatus | string;

interface StatusBadgeProps {
  status: BadgeVariant;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  // Student Status
  LEAD: { label: 'مهتم', className: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  TRIAL: { label: 'تجريبي', className: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  ACTIVE: { label: 'نشط', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  SUSPENDED: { label: 'موقوف', className: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  GRADUATED: { label: 'متخرج', className: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  DROPPED: { label: 'منسحب', className: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },

  // Session Status
  SCHEDULED: { label: 'مجدولة', className: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'جارية', className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  COMPLETED: { label: 'مكتملة', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  CANCELLED: { label: 'ملغاة', className: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  POSTPONED: { label: 'مؤجلة', className: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },

  // Invoice Status
  DRAFT: { label: 'مسودة', className: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  SENT: { label: 'مُرسلة', className: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  PAID: { label: 'مدفوعة', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  OVERDUE: { label: 'متأخرة', className: 'bg-red-100 text-red-700', dot: 'bg-red-500' },

  // Payment Status
  PENDING: { label: 'معلقة', className: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  REFUNDED: { label: 'مُسترجعة', className: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass} ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
      {config.label}
    </span>
  );
};
