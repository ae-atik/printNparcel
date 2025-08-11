import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  helperText,
  error,
  icon,
  className,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'peer w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text placeholder-transparent focus:outline-none focus:border-campus-green focus:shadow-glow transition-all duration-300',
            icon && 'pl-10',
            error && 'border-danger focus:border-danger focus:shadow-none',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
          placeholder=" "
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 transition-all duration-300 pointer-events-none',
              icon && 'left-10',
              (isFocused || hasValue || props.value) 
                ? 'top-0 text-xs bg-theme-bg px-2 -translate-y-1/2 text-campus-green'
                : 'top-1/2 text-base -translate-y-1/2 text-theme-text-muted',
              error && 'text-danger'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {(helperText || error) && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-danger' : 'text-theme-text-secondary'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};