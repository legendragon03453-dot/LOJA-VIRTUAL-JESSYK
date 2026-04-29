import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Search } from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'pedido_gerado', title: 'Pedido Gerado', color: 'bg-zinc-100 border-zinc-200' },
  { id: 'preparando_pedido', title: 'Preparando', color: 'bg-blue-50 border-blue-200' },
  { id: 'enviado_correio', title: 'Enviado p/ Correio', color: 'bg-purple-50 border-purple-200' },
  { id: 'indo_destino', title: 'Indo ao Destino', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'entregue', title: 'Entregue', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'reembolsado', title: 'Reembolsado', color: 'bg-rose-50 border-rose-200' }
];

export function OrdersTab() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map legacy "pending" to "pedido_gerado" if needed
      const mapped = data.map(o => ({
        ...o,
        status: o.status === 'pending' ? 'pedido_gerado' : o.status
      }));
      setOrders(mapped);
    }
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: statusId } : o));

    // DB update
    const { error } = await supabase.from('orders').update({ status: statusId }).eq('id', orderId);
    if (error) {
      console.error("Error updating order status:", error);
      fetchOrders(); // rollback
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-zinc-400" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Kanban de Pedidos</h1>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {KANBAN_COLUMNS.map(col => (
          <div 
            key={col.id} 
            className={`min-w-[280px] flex-shrink-0 flex flex-col rounded-2xl border ${col.color} bg-opacity-50 h-[70vh] overflow-hidden`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-4 border-b border-inherit bg-white/50 backdrop-blur-sm sticky top-0">
              <h3 className="font-bold text-sm text-zinc-800 uppercase tracking-widest">{col.title}</h3>
              <p className="text-[10px] text-zinc-500 font-medium">
                {orders.filter(o => o.status === col.id).length} pedidos
              </p>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {orders.filter(o => o.status === col.id).map(order => (
                <div 
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative group"
                >
                  <p className="text-[10px] text-zinc-400 font-mono mb-1 truncate">#{order.id.split('-')[0]}</p>
                  <p className="text-sm font-bold text-zinc-800 mb-2 truncate" title={order.customer_email}>{order.customer_email}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      R$ {Number(order.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
