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
      <div className={`relative flex items-center justify-center ${iconSize} rounded-lg bg-charcoal-900 text-white shadow-subtle overflow-hidden border border-charcoal-800 flex-shrink-0`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Outer optical reticle ring */}
          <circle cx="18" cy="18" r="14" stroke="#4f6d5a" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
          
          {/* Inner aperture boundary */}
          <circle cx="18" cy="18" r="8.5" stroke="#8faa98" strokeWidth="1.5" />
          
          {/* Deep lesion focal nucleus */}
          <circle cx="18" cy="18" r="3" fill="#8faa98" />
          
          {/* Neural graph nodes */}
          <circle cx="11" cy="14" r="1.25" fill="#d7e3da" />
          <circle cx="25" cy="14" r="1.25" fill="#d7e3da" />
          <circle cx="18" cy="27" r="1.25" fill="#d7e3da" />
          
          {/* Feature connection paths */}
          <path d="M11 14L18 18M25 14L18 18M18 27L18 18" stroke="#698874" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-charcoal-900 ${textSize}`}>
            SKINDERMO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-sage-600" />
        </div>
        {showSubtitle && (
          <span className={`font-mono uppercase tracking-wider text-charcoal-500 font-medium ${subtextSize} -mt-0.5`}>
            AI Lesion Research
          </span>
        )}
      </div>
    </div>
  );
};
