import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [toastProps, setToastProps] = useState<ToastOptions>({ message: '' });

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    setToastProps({ message, type, duration });
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    toastProps,
    showToast,
    hideToast,
  };
};