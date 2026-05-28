// ============================================================
// AVATAR COMPONENT
// ============================================================

import React from 'react';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
};

const GRADIENT_MAP = [
  'from-[#1B4F72] to-[#2E86AB]',
  'from-[#6C3483] to-[#9B59B6]',
  'from-[#1E8449] to-[#27AE60]',
  'from-[#E67E22] to-[#F39C12]',
  'from-[#922B21] to-[#E74C3C]',
  'from-[#1A5276] to-[#2980B9]',
];

const getGradient = (name: string): string => {
  const index = name.charCodeAt(0) % GRADIENT_MAP.length;
  return GRADIENT_MAP[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  className = '',
}) => {
  const sizeClass = SIZE_MAP[size];
  const gradient = getGradient(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradient} flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
