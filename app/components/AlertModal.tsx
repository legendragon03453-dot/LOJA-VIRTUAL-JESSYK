"use client";

import { useAlertStore } from '@/store/useAlertStore';
import { AlertCircle } from 'lucide-react';

export function AlertModal() {
  const { isOpen, type, message, onConfirm, closeAlert } = useAlertStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-['Helvetica',_sans-serif]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeAlert}></div>
      <div className="relative bg-[#191A21] border border-white/10 p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={24} className="text-[#A9AFDE]" />
          </div>
          <p className="text-white text-sm tracking-wide leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex w-full gap-4">
            {type === 'confirm' && (
              <button 
                onClick={closeAlert}
                className="flex-1 border border-white/20 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={() => {
                if (type === 'confirm' && onConfirm) onConfirm();
                closeAlert();
              }}
              className="flex-1 bg-white text-black px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#A9AFDE] hover:text-white transition-colors"
            >
              {type === 'confirm' ? 'Confirmar' : 'Entendi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
