import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
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
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'peer w-full px-3 py-3 border border-gray-300 rounded-component bg-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-campus-green focus:border-transparent transition-all',
            icon && 'pl-10',
            error && 'border-danger focus:ring-danger',
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
              'absolute left-3 transition-all duration-200 pointer-events-none',
              icon && 'left-10',
              (isFocused || hasValue || props.value) 
                ? 'top-0 text-xs bg-white px-1 -translate-y-1/2 text-campus-green'
                : 'top-1/2 text-base -translate-y-1/2 text-gray-400',
              error && 'text-danger'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {(helperText || error) && (
        <p className={cn(
          'mt-1 text-sm',
          error ? 'text-danger' : 'text-gray-600'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};