import { toast as sonnerToast } from 'sonner';

const toast = {
  success: (message, options = {}) => {
    return sonnerToast.success(message, {
      duration: 3000,
      ...options,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        ...options.style,
      },
    });
  },
  
  error: (message, options = {}) => {
    return sonnerToast.error(message, {
      duration: 4000,
      ...options,
      style: {
        background: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        ...options.style,
      },
    });
  },
  
  info: (message, options = {}) => {
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
        ...options.style,
      },
    });
  },
  
  warning: (message, options = {}) => {
    return sonnerToast.warning(message, {
      duration: 3500,
      ...options,
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
        ...options.style,
      },
    });
  },
  
  // Direct access to sonner's toast for advanced usage
  custom: sonnerToast,
};

export function useToast() {
  return toast;
}

export function Toaster() {
  // Sonner's Toaster is imported and used directly in the root layout
  return null;
}

export { toast };
