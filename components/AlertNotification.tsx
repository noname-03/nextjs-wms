'use client';

import { useState, useEffect } from 'react';

interface AlertNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function AlertNotification({
  message,
  type = 'info',
  duration = 3000,
  onClose
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          iconColor: 'text-green-400',
          textColor: 'text-green-800',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          iconColor: 'text-red-400',
          textColor: 'text-red-800',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-400',
          textColor: 'text-yellow-800',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          )
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-400',
          textColor: 'text-blue-800',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-400',
          textColor: 'text-gray-800',
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        isLeaving ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
      }`}
    >
      <div className={`w-72 sm:w-80 md:w-96 max-w-[calc(100vw-1rem)] shadow-lg rounded-lg pointer-events-auto border ${styles.bg}`}>
        <div className="p-3 sm:p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {styles.icon}
              </svg>
            </div>
            <div className="ml-2 sm:ml-3 w-0 flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium ${styles.textColor} break-words`}>
                {message}
              </p>
            </div>
            <div className="ml-2 sm:ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className={`rounded-md inline-flex ${styles.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-400 transition-opacity duration-200`}
              >
                <span className="sr-only">Close</span>
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}