import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GlassCard } from './GlassCard';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <GlassCard 
        className={cn(
          'relative w-full max-h-[90vh] overflow-y-auto',
          sizeClasses[size]
        )}
        padding="none"
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-glass-border">
            <h2 className="text-xl font-semibold text-theme-text">{title}</h2>
            <button
              onClick={onClose}
              className="text-theme-text-muted hover:text-theme-text transition-colors p-1 rounded-component hover:bg-glass-hover"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </GlassCard>
    </div>
  );

  return createPortal(modalContent, document.body);
};