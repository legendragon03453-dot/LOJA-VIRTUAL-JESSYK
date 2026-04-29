import { create } from 'zustand';

type AlertType = 'alert' | 'confirm';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  message: string;
  onConfirm?: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  type: 'alert',
  message: '',
  showAlert: (message) => set({ isOpen: true, type: 'alert', message, onConfirm: undefined }),
  showConfirm: (message, onConfirm) => set({ isOpen: true, type: 'confirm', message, onConfirm }),
  closeAlert: () => set({ isOpen: false, message: '' })
}));
