import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <div className={clsx('flex items-center justify-center gap-2', className)}>
      <Loader2 size={sizeMap[size]} className="animate-spin" />
      {text && <span className="text-text">{text}</span>}
    </div>
  );
};
