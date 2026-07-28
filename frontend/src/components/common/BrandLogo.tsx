import React from 'react';
import { useThemeMode } from '../../context/ThemeContext';

interface BrandLogoProps {
  storeName?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'auto' = follows theme, 'white' = always white (for dark panels), 'dark' = always dark teal */
  variant?: 'auto' | 'white' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  storeName = 'Owshika Enterprises',
  size = 'md',
  variant = 'auto',
}) => {
  const { mode } = useThemeMode();

  const parts = storeName.split(' ');
  const firstWord = (parts[0] || 'Owshika').toLowerCase();
  const secondWord = (parts.slice(1).join(' ') || 'enterprises').toLowerCase();

  const textSize =
    size === 'sm' ? 'text-lg' :
    size === 'lg' ? 'text-2xl sm:text-3xl' :
    'text-xl sm:text-2xl';

  let primaryColor: string;
  let secondaryColor: string;

  if (variant === 'white') {
    primaryColor   = '#ffffff';
    secondaryColor = 'rgba(255,255,255,0.65)';
  } else if (variant === 'dark') {
    primaryColor   = '#051c1a';
    secondaryColor = 'rgba(5,28,26,0.55)';
  } else {
    /* auto: dark mode → white; light mode → dark teal (like "pine labs" on pinelabs.com) */
    primaryColor   = mode === 'dark' ? '#ffffff'             : '#051c1a';
    secondaryColor = mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(5,28,26,0.55)';
  }

  return (
    <div className="flex items-center select-none py-1">
      <div className={`${textSize} font-black tracking-tight leading-none flex items-center gap-1.5`}>
        <span style={{ color: primaryColor, fontWeight: 800 }}>{firstWord}</span>
        <span style={{ color: secondaryColor, fontWeight: 400 }}>{secondWord}</span>
      </div>
    </div>
  );
};
