import React from 'react';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div className={clsx(
      'flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-800 text-sm border border-red-200',
      className
    )}>
      <AlertCircle size={16} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
