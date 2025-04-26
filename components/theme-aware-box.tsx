'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeAwareBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ThemeAwareBox({ children, className, ...props }: ThemeAwareBoxProps) {
  const { theme } = useTheme();
  
  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800 text-gray-100' 
          : 'bg-white border-gray-200 text-gray-900',
        className
      )}
      {...props}
    >
      <div className="text-sm mb-2">
        Current theme: <span className="font-medium">{theme}</span>
      </div>
      {children}
    </div>
  );
} 