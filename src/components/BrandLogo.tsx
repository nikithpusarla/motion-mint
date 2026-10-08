import React from 'react';
import motionMintLogoPath from '../assets/images/motion_mint_logo_1787827107679.jpg';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  badgeText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  className = '',
  badgeText = 'v1.0',
}) => {
  const sizeMap = {
    xs: {
      box: 'w-7 h-7 rounded-xl',
      text: 'text-sm',
      subtext: 'text-[10px]',
      badge: 'text-[8px] px-1.5 py-0.2',
    },
    sm: {
      box: 'w-9 h-9 rounded-2xl',
      text: 'text-base',
      subtext: 'text-[11px]',
      badge: 'text-[9px] px-2 py-0.5',
    },
    md: {
      box: 'w-11 h-11 rounded-2xl',
      text: 'text-lg',
      subtext: 'text-xs',
      badge: 'text-[9px] px-2 py-0.5',
    },
    lg: {
      box: 'w-14 h-14 rounded-3xl',
      text: 'text-xl',
      subtext: 'text-xs',
      badge: 'text-[10px] px-2.5 py-0.5',
    },
    xl: {
      box: 'w-20 h-20 rounded-[28px]',
      text: 'text-2xl',
      subtext: 'text-sm',
      badge: 'text-xs px-3 py-1',
    },
    hero: {
      box: 'w-24 h-24 rounded-[32px]',
      text: 'text-3xl',
      subtext: 'text-sm',
      badge: 'text-xs px-3 py-1',
    },
  };

  const config = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* 3D App Icon Container */}
      <div className="relative shrink-0">
        {/* Ambient Glow Aura */}
        <div
          className={`absolute -inset-1.5 rounded-[inherit] bg-gradient-to-tr from-[#30D158]/40 via-[#0A84FF]/30 to-[#BF5AF2]/20 blur-md opacity-60 group-hover:opacity-100 transition-all duration-500`}
        />

        {/* Primary Glass Icon Plate */}
        <div
          className={`relative ${config.box} overflow-hidden bg-black/90 border border-white/20 p-0.5 shadow-2xl shadow-[#30D158]/20 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-1`}
        >
          <img
            src={motionMintLogoPath}
            alt="Motion Mint Logo"
            className="w-full h-full object-cover rounded-[inherit]"
            referrerPolicy="no-referrer"
          />

          {/* High-Gloss Highlight Reflection */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/25 via-transparent to-black/30 rounded-[inherit]" />
        </div>
      </div>

      {/* Typography & Subtitle */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-display font-bold ${config.text} tracking-tight text-white group-hover:text-[#30D158] transition-colors`}
            >
              Motion Mint
            </span>
            {showBadge && (
              <span
                className={`font-mono font-semibold uppercase rounded-full bg-white/[0.08] text-[#30D158] border border-[#30D158]/30 shadow-sm ${config.badge}`}
              >
                {badgeText}
              </span>
            )}
          </div>
          <p className={`${config.subtext} text-[#86868B] font-normal leading-tight`}>
            Mint screen time through movement & focus
          </p>
        </div>
      )}
    </div>
  );
};
