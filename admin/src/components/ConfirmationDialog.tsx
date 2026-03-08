
import { ReactNode } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content w-96">
        <div className="modal-header">
          <h2 className={isDanger ? 'text-red-400' : 'text-white'}>{title}</h2>
        </div>
        <div className="modal-body">
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="modal-footer flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-600/30 text-gray-300 border border-gray-500/30 hover:bg-gray-600/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
              isDanger
                ? 'bg-red-600/30 text-red-300 border border-red-500/30 hover:bg-red-600/50 hover:border-red-500/50'
                : 'bg-primary-gold/30 text-primary-gold border border-primary-gold/50 hover:bg-primary-gold/50 hover:border-primary-gold/70'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
