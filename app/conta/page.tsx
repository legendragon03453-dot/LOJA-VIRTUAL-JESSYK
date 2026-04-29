"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Package, CheckCircle2, Truck, Box, DollarSign, LogOut, MessageCircle, Mail, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

const STATUS_STEPS = [
  { id: 'pedido_gerado', label: 'Gerado', icon: Package },
  { id: 'preparando_pedido', label: 'Preparando', icon: Box },
  { id: 'enviado_correio', label: 'Enviado', icon: Truck },
  { id: 'indo_destino', label: 'A Caminho', icon: Truck },
  { id: 'entregue', label: 'Entregue', icon: CheckCircle2 },
  { id: 'reembolsado', label: 'Reembolsado', icon: DollarSign }
];

export default function ClientAccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Zustand Cart
  const { items: cartItems } = useCartStore();

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    setLoading(true);
    
    // Auth Check
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      router.push('/login');
      return;
    }
    
    setUser(session.user);

    // Fetch User's Orders
    const { data: userOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', session.user.email)
      .order('created_at', { ascending: false });
      
    if (userOrders) setOrders(userOrders);

    // Fetch Suggestions (Featured or latest products)
    const { data: featured } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
      
    if (featured) setSuggestions(featured);

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#191A21]"><Loader2 className="animate-spin text-white"/></div>;

  return (
    <div className="min-h-screen bg-[#191A21] text-white font-['Helvetica',_sans-serif] pb-24">
      
      {/* Header */}
      <header className="bg-[#242628] border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
               <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/LOGO%20LOJA.webp?raw=true" alt="JESSYK" className="h-6" />
            </Link>
            <span className="text-[#A9AFDE] text-sm tracking-widest uppercase border-l border-zinc-700 pl-4 hidden md:inline-block">Acervo Pessoal</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs tracking-widest text-zinc-400 hidden sm:inline-block">{user?.email}</span>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-16">
        
        {/* Section 1: Orders Tracker */}
        <section>
          <h2 className="text-xl font-light tracking-widest uppercase text-white mb-8 border-b border-zinc-800 pb-4">
            Acompanhamento de Pedidos
          </h2>

          {orders.length === 0 ? (
            <div className="bg-[#242628] border border-zinc-800 p-12 text-center text-zinc-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="tracking-widest uppercase text-xs">Você ainda não possui aquisições no acervo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'pending' ? 'pedido_gerado' : order.status));
                const isRefunded = order.status === 'reembolsado';

                return (
                  <div key={order.id} className="bg-[#242628] border border-zinc-800 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#A9AFDE] tracking-widest mb-1">Pedido #{order.id.split('-')[0]}</p>
                        <p className="text-xl font-light">{Number(order.total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">Realizado em</p>
                        <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* Linear Progress Tracker */}
                    <div className="relative pt-2 pb-6 px-2 md:px-8">
                      <div className="absolute top-6 left-[5%] right-[5%] h-[2px] bg-zinc-800 z-0"></div>
                      <div 
                        className="absolute top-6 left-[5%] h-[2px] bg-white transition-all duration-1000 z-0" 
                        style={{ width: isRefunded ? '100%' : `${(currentStepIndex / (STATUS_STEPS.length - 2)) * 90}%`, backgroundColor: isRefunded ? '#e11d48' : '#ffffff' }}
                      ></div>

                      <div className="flex justify-between relative z-10">
                        {STATUS_STEPS.map((step, idx) => {
                          if (step.id === 'reembolsado' && !isRefunded) return null;
                          if (isRefunded && step.id !== 'pedido_gerado' && step.id !== 'reembolsado') return null;

                          const isActive = isRefunded ? step.id === 'reembolsado' : idx <= currentStepIndex;
                          const isCurrent = isRefunded ? step.id === 'reembolsado' : idx === currentStepIndex;
                          const Icon = step.icon;

                          return (
                            <div key={step.id} className="flex flex-col items-center gap-3 w-16 md:w-24">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                                isCurrent ? (isRefunded ? 'bg-rose-900 border-rose-500 text-rose-100' : 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]') : 
                                isActive ? 'bg-zinc-800 border-white text-white' : 
                                'bg-[#242628] border-zinc-800 text-zinc-600'
                              }`}>
                                <Icon size={16} />
                              </div>
                              <span className={`text-[9px] md:text-[10px] text-center uppercase tracking-widest font-bold ${
                                 isCurrent ? (isRefunded ? 'text-rose-500' : 'text-white') : 
                                 isActive ? 'text-zinc-400' : 'text-zinc-600'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Section 2: Current Cart Preview */}
          <section className="lg:col-span-1">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white mb-6 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#A9AFDE]" /> Sua Sacola
            </h2>
            <div className="bg-[#242628] border border-zinc-800 p-6 space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-zinc-500 text-xs tracking-widest uppercase text-center py-8">Sacola Vazia</p>
              ) : (
                <>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain bg-zinc-900" />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-white truncate w-32">{item.name}</p>
                          <p className="text-[10px] text-[#A9AFDE] mt-1">{Number(item.price).toLocaleString('pt-BR', {style: 'currency', currency:'BRL'})} x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/" className="block text-center bg-white text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#A9AFDE] hover:text-white transition-colors mt-4">
                    Finalizar no Acervo
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Section 3: Suggested Products */}
          <section className="lg:col-span-2">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white mb-6">
              Sugestões da Curadoria
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {suggestions.map(product => (
                <Link href="/" key={product.id} className="group bg-[#242628] border border-zinc-800 p-4 flex flex-col md:flex-row items-center gap-4 hover:border-zinc-600 transition-colors cursor-pointer">
                  <div className="w-24 h-24 bg-white/5 flex items-center justify-center p-2">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <p className="text-xs uppercase tracking-widest text-white mb-2 truncate max-w-[150px]">{product.name}</p>
                    <p className="text-sm font-light text-[#A9AFDE]">{Number(product.price).toLocaleString('pt-BR', {style: 'currency', currency:'BRL'})}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Section 4: Support */}
        <section className="border-t border-zinc-800 pt-16">
          <div className="bg-[#242628] border border-zinc-800 p-8 md:p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-lg font-light tracking-widest uppercase text-white mb-4">Precisa de Assistência?</h2>
            <p className="text-sm text-zinc-400 mb-8 font-light leading-relaxed">Nossa equipe de concierges está à disposição para auxiliar com o seu pedido, trocas ou dúvidas sobre as peças exclusivas.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#A9AFDE] hover:text-white transition-colors">
                <MessageCircle size={16} /> Contato via WhatsApp
              </a>
              <a href="mailto:concierge@jessyk.com" className="flex items-center justify-center gap-3 bg-transparent border border-white text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                <Mail size={16} /> E-mail Oficial
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
