'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AlertNotification from '@/components/AlertNotification';

interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const showAlert = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info', 
    duration = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert: Alert = {
      id,
      message,
      type,
      duration
    };
    
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    showAlert(message, 'success', duration);
  }, [showAlert]);

  const showError = useCallback((message: string, duration = 5000) => {
    showAlert(message, 'error', duration);
  }, [showAlert]);

  const showWarning = useCallback((message: string, duration = 4000) => {
    showAlert(message, 'warning', duration);
  }, [showAlert]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showAlert(message, 'info', duration);
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{
      showAlert,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      
      {/* Render alerts */}
      <div className="fixed top-16 right-2 sm:top-20 sm:right-4 z-[9999] pointer-events-none max-w-[calc(100vw-1rem)]">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className="relative pointer-events-auto mb-2"
            style={{ 
              marginTop: index === 0 ? '0' : '8px' // Small gap between stacked alerts
            }}
          >
            <AlertNotification
              message={alert.message}
              type={alert.type}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}