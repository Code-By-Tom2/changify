import { useToast } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useUnifiedToast() {
  const { toast } = useToast();

  const showToast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 5000 } = options;
    
    toast({
      title,
      description,
      variant,
      duration,
    });
  };

  const success = (message: string, title?: string) => {
    showToast({
      title,
      description: message,
      variant: 'default',
    });
  };

  const error = (message: string, title?: string) => {
    showToast({
      title,
      description: message,
      variant: 'destructive',
    });
  };

  return {
    success,
    error,
    toast: showToast,
  };
} 