'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  "fixed flex items-center w-auto max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border border-gray-200",
        success: "bg-green-50 text-green-900 border border-green-200",
        error: "bg-red-50 text-red-900 border border-red-200",
        warning: "bg-yellow-50 text-yellow-900 border border-yellow-200",
        info: "bg-blue-50 text-blue-900 border border-blue-200",
      },
      position: {
        topRight: "top-4 right-4",
        topLeft: "top-4 left-4",
        bottomRight: "bottom-4 right-4",
        bottomLeft: "bottom-4 left-4",
      },
      visibility: {
        visible: "opacity-100 translate-y-0",
        hidden: "opacity-0 translate-y-2",
      }
    },
    defaultVariants: {
      variant: "default",
      position: "topRight",
      visibility: "hidden"
    }
  }
);

export interface NotificationToastProps extends VariantProps<typeof toastVariants> {
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export function NotificationToast({
  title,
  message,
  variant = "default",
  position = "topRight",
  duration = 5000,
  onClose,
  className
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const IconComponent = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />;
    }
  };

  return (
    <div
      className={cn(
        toastVariants({ variant, position, visibility: isVisible ? "visible" : "hidden" }),
        className
      )}
      role="alert"
    >
      <IconComponent />
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast container to manage multiple toasts
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}