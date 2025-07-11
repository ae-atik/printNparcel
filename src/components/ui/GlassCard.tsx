import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = false, 
  padding = 'md',
  blur = 'md',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-glass',
    lg: 'backdrop-blur-xl',
  };

  return (
    <div
      className={cn(
        'bg-glass-bg border border-glass-border rounded-glass shadow-glass transition-all duration-300',
        blurClasses[blur],
        hover && 'hover:bg-glass-hover hover:shadow-glass-hover hover:scale-105',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};