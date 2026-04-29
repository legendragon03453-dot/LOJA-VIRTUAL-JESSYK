"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Package, CheckCircle2, Truck, Box, DollarSign } from 'lucide-react';

const STATUS_STEPS = [
  { id: 'pedido_gerado', label: 'Pedido Gerado', icon: Package },
  { id: 'preparando_pedido', label: 'Preparando', icon: Box },
  { id: 'enviado_correio', label: 'Enviado Correio', icon: Truck },
  { id: 'indo_destino', label: 'A Caminho', icon: Truck },
  { id: 'entregue', label: 'Entregue', icon: CheckCircle2 },
  { id: 'reembolsado', label: 'Reembolsado', icon: DollarSign }
];

export default function ClientAccountPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    // Em produção real, você pegaria o e-mail do auth.user:
    // const { data: { user } } = await supabase.auth.getUser();
    // Por enquanto listamos tudo para visualização:
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a1c1d]"><Loader2 className="animate-spin text-white"/></div>

  return (
    <div className="min-h-screen bg-[#1a1c1d] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-100">Minha Conta Jessyk</h1>
          <p className="text-sm text-zinc-500 mt-2">Acompanhe o trajeto dos seus itens exclusivos.</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-[#242628] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            Você ainda não possui pedidos.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'pending' ? 'pedido_gerado' : order.status));
              const isRefunded = order.status === 'reembolsado';

              return (
                <div key={order.id} className="bg-[#242628] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Pedido #{order.id.split('-')[0]}</p>
                      <p className="text-sm font-medium mt-1">R$ {Number(order.total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Data</p>
                      <p className="text-sm font-medium mt-1">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="relative pt-2 pb-6 px-4">
                    <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-zinc-800 rounded-full z-0"></div>
                    <div 
                      className="absolute top-6 left-[10%] h-1 bg-emerald-600 rounded-full z-0 transition-all duration-1000" 
                      style={{ width: isRefunded ? '100%' : `${(currentStepIndex / (STATUS_STEPS.length - 2)) * 80}%`, backgroundColor: isRefunded ? '#e11d48' : '' }}
                    ></div>

                    <div className="flex justify-between relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        // Skip refunded from timeline unless it is refunded
                        if (step.id === 'reembolsado' && !isRefunded) return null;
                        if (isRefunded && step.id !== 'pedido_gerado' && step.id !== 'reembolsado') return null; // Simplified view for refunded

                        const isActive = isRefunded ? step.id === 'reembolsado' : idx <= currentStepIndex;
                        const isCurrent = isRefunded ? step.id === 'reembolsado' : idx === currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.id} className="flex flex-col items-center gap-3 w-20">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                              isCurrent ? (isRefunded ? 'bg-rose-600 text-white shadow-rose-600/30' : 'bg-emerald-600 text-white shadow-emerald-600/30') : 
                              isActive ? 'bg-zinc-700 text-zinc-300' : 
                              'bg-zinc-900 text-zinc-600 border border-zinc-800'
                            }`}>
                              <Icon size={16} />
                            </div>
                            <span className={`text-[10px] text-center uppercase tracking-widest font-bold ${
                               isCurrent ? (isRefunded ? 'text-rose-500' : 'text-emerald-500') : 
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
      </div>
    </div>
  );
}
