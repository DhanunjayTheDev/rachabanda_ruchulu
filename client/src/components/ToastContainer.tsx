import { useToast } from '@/lib/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/50 bg-green-500/10';
      case 'error': return 'border-red-500/50 bg-red-500/10';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'info': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getProgressColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast: any) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-auto glass rounded-xl p-4 border ${getColors(toast.type)} cursor-pointer relative overflow-hidden`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{getIcon(toast.type)}</span>
              <p className="text-white text-sm flex-1">{toast.message}</p>
              <button
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                className="text-gray-400 hover:text-white text-lg flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <div
                className={`h-full ${getProgressColor(toast.type)} animate-shrink`}
                style={{ animationDuration: '4s' }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
