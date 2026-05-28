// ============================================================
// LOADING SPINNER COMPONENT
// ============================================================

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${SIZE_MAP[size]} border-[#E2E8F0] border-t-[#1B4F72] rounded-full animate-spin`}
        style={{ borderStyle: 'solid' }}
      />
      {text && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = 'جاري التحميل...' }) => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
    <div className="skeleton h-3 w-full rounded" />
    <div className="skeleton h-8 w-24 rounded" />
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <div className="skeleton h-5 w-48 rounded" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    ))}
  </div>
);
