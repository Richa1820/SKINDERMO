import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'emerald' | 'amber' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantStyles = {
    forest: 'bg-forest-50 text-forest-800 border-forest-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
    slate: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200',
    outline: 'bg-transparent text-charcoal-700 border-charcoal-200',
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${variantStyles} ${sizeStyles} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
