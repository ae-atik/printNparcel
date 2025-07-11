import React from 'react';
import { cn } from '../../utils/cn';

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  position = 'bottom-right',
  size = 'md',
  className,
  ...props
}) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <button
      className={cn(
        'fixed z-50 rounded-full bg-campus-green text-white shadow-glass hover:bg-campus-green-hover hover:shadow-glass-hover transition-all duration-300 flex items-center justify-center backdrop-blur-glass border border-glass-border hover:scale-110 active:scale-95',
        positions[position],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
};