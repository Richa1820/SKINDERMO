import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const subtextSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Dermoscopic Aperture + Neural Topology Emblem */}
      <div className={`relative flex items-center justify-center ${iconSize} rounded-xl bg-teal-700 text-white shadow-subtle overflow-hidden border border-teal-800 flex-shrink-0`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Outer optical reticle ring */}
          <circle cx="18" cy="18" r="14" stroke="#99f6e4" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
          
          {/* Inner aperture boundary */}
          <circle cx="18" cy="18" r="8.5" stroke="#5eead4" strokeWidth="1.5" />
          
          {/* Deep lesion focal nucleus */}
          <circle cx="18" cy="18" r="3" fill="#5eead4" />
          
          {/* Neural graph nodes */}
          <circle cx="11" cy="14" r="1.25" fill="#ccfbf1" />
          <circle cx="25" cy="14" r="1.25" fill="#ccfbf1" />
          <circle cx="18" cy="27" r="1.25" fill="#ccfbf1" />
          
          {/* Feature connection paths */}
          <path d="M11 14L18 18M25 14L18 18M18 27L18 18" stroke="#2dd4bf" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col -space-y-0.5">
        <span className={`${textSize} font-bold tracking-tight text-charcoal-900 font-display`}>
          SKINDERMO
        </span>
        {showSubtitle && (
          <span className={`${subtextSize} font-mono text-charcoal-500 tracking-tight`}>
            AI Skin Lesion Analysis
          </span>
        )}
      </div>
    </div>
  );
};