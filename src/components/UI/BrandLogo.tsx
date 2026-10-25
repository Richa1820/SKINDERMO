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
      <div className={`relative flex items-center justify-center ${iconSize} rounded-xl bg-forest-950 text-white shadow-subtle overflow-hidden border border-forest-800/60 flex-shrink-0 group`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 transition-transform duration-500 group-hover:rotate-45"
        >
          {/* Outer optical reticle ring */}
          <circle cx="18" cy="18" r="14" stroke="#286D53" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          
          {/* Inner aperture boundary */}
          <circle cx="18" cy="18" r="9" stroke="#34D399" strokeWidth="1.75" />
          
          {/* Deep lesion focal nucleus */}
          <circle cx="18" cy="18" r="3.5" fill="#34D399" />
          
          {/* Neural graph nodes */}
          <circle cx="10" cy="13" r="1.5" fill="#A7F3D0" />
          <circle cx="26" cy="13" r="1.5" fill="#A7F3D0" />
          <circle cx="18" cy="28" r="1.5" fill="#A7F3D0" />
          
          {/* Feature connection paths */}
          <path d="M10 13L18 18M26 13L18 18M18 28L18 18" stroke="#5BA687" strokeWidth="1.2" strokeLinecap="round" />
        </svg>

        {/* Ambient mint specular highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-emerald-400/10 pointer-events-none" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-forest-950 ${textSize}`}>
            SKINDERMO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        {showSubtitle && (
          <span className={`font-mono uppercase tracking-widest text-charcoal-400 font-medium ${subtextSize} -mt-0.5`}>
            AI Lesion Research
          </span>
        )}
      </div>
    </div>
  );
};
