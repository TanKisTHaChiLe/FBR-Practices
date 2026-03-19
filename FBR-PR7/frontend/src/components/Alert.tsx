import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  };

  return (
    <div className={`rounded-lg border ${styles[type].bg} ${styles[type].border} p-4 mb-4 animate-fade-in`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {styles[type].icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles[type].text}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto">
            <XCircleIcon className={`h-5 w-5 ${styles[type].text}`} />
          </button>
        )}
      </div>
    </div>
  );
};