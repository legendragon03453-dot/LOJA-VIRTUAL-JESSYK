"use client";

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function CartDrawer() {
  const { items, isCartOpen, toggleCart, removeItem } = useCartStore();
  const cartTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user has address
    const { data } = await supabase.from('clients').select('address, zip_code').eq('id', user.id).single();
    if (!data || !data.address || !data.zip_code) {
      alert('Por favor, preencha seu Endereço de Entrega na aba "Minha Conta" antes de finalizar a compra.');
      router.push('/conta');
    } else {
      alert('Redirecionando para o pagamento seguro...');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end font-['Helvetica',_sans-serif]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleCart} />
      <div className="relative w-full max-w-md bg-[#191A21] h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white text-xl tracking-widest uppercase">Sacola de Curadoria</h2>
          <button onClick={toggleCart} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center tracking-widest uppercase mt-20">Sua sacola está vazia.</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 border border-white/5 bg-[#1F2029] p-4">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-contain bg-white/5" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-sm tracking-widest uppercase truncate">{item.name}</h3>
                    <p className="text-[#A9AFDE] text-sm mt-1">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-500 text-sm">Qtd: {item.quantity}</span>
                    <button onClick={() => removeItem(item.id)} className="text-red-500/80 hover:text-red-500 text-sm tracking-wider uppercase">
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#1F2029]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 tracking-widest uppercase text-sm">Total do Investimento</span>
              <span className="text-white text-xl font-light">{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-white text-black font-bold tracking-widest uppercase p-4 hover:bg-[#A9AFDE] transition-colors">
              FINALIZAR AQUISIÇÃO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
