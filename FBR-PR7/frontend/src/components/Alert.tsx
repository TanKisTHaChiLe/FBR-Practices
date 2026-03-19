import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-900/30',
      border: 'border-green-700',
      text: 'text-green-300',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />
    },
    error: {
      bg: 'bg-red-900/30',
      border: 'border-red-700',
      text: 'text-red-300',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />
    },
    warning: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-700',
      text: 'text-yellow-300',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
    },
    info: {
      bg: 'bg-blue-900/30',
      border: 'border-blue-700',
      text: 'text-blue-300',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  };

  return (
    <div className={`rounded-xl border ${styles[type].bg} ${styles[type].border} p-4 mb-4 backdrop-blur-sm`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {styles[type].icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles[type].text}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto hover:opacity-70 transition-opacity">
            <XMarkIcon className={`h-5 w-5 ${styles[type].text}`} />
          </button>
        )}
      </div>
    </div>
  );
};