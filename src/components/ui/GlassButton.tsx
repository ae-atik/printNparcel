import React from 'react';
import { cn } from '../../utils/cn';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-component transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-glass';
  
  const variants = {
    primary: 'bg-campus-green text-white hover:bg-campus-green-hover focus:ring-campus-green shadow-lg hover:shadow-xl',
    secondary: 'bg-glass-bg border border-glass-border text-dark-text hover:bg-glass-hover focus:ring-campus-green',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success shadow-lg hover:shadow-xl',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-lg hover:shadow-xl',
    ghost: 'text-dark-text hover:bg-glass-bg focus:ring-campus-green',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        glow && 'animate-glow',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};