import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { cn } from '../../utils/cn';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <GlassButton
      variant="secondary"
      size="sm"
      glow
      onClick={handleClick}
      className={cn('flex items-center space-x-2 backdrop-blur-lg bg-white/20 dark:bg-white/10 border border-white/30', className)}
    >
      <ArrowLeft size={16} />
    </GlassButton>
  );
};
