import React from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <GlassCard className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-theme-text mb-2">{title}</h3>
            <div className="text-theme-text-secondary text-sm leading-relaxed">
              {message}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </GlassButton>
            <GlassButton
              variant={confirmVariant}
              className="flex-1"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ConfirmDialog;
