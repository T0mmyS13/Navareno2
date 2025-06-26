import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ variant = 'info', children, onClose, className, ...props }) => {
  const variants = {
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: CheckCircle,
      iconColor: "text-green-400"
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800", 
      icon: AlertCircle,
      iconColor: "text-red-400"
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: AlertCircle,
      iconColor: "text-yellow-400"
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
      iconColor: "text-blue-400"
    }
  };

  const Icon = variants[variant].icon;

  return (
    <div
      className={cn(
        "rounded-md border p-4 flex items-start gap-3",
        variants[variant].container,
        className
      )}
      {...props}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", variants[variant].iconColor)} />
      <div className="flex-1">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
