import { cn } from '@/lib/utils';
import React from 'react';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 450 75"
      className={cn('fill-current', className)}
      aria-label="Momentum Film Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.4 }} />
          <stop offset="60%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M.75 62.45l57.73-58.42c2.4-2.43 5.9-3.4 9.1-2.9l376.5 57.5c4.7 0.7 8.16 4.7 8.16 9.45v0c0 4.14-2.7 7.78-6.66 9.05L68.3 75 .75 62.45z"
        fill="url(#logoGradient)"
      />
      <text
        x="270"
        y="30"
        fontFamily="'Manrope', sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        style={{
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
            letterSpacing: '0.05em'
        }}
      >
        MOMENTUM FILM
      </text>
    </svg>
  );
};
