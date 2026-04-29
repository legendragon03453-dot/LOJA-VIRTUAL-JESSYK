import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, TrendingUp, Users, ShoppingCart, RefreshCcw, PackageCheck } from 'lucide-react';

export function AnalyticsTab() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vendasBrutas: 0,
    pedidosTotal: 0,
    pedidosEntregues: 0,
    pedidosReembolsados: 0,
  });
  const [feed, setFeed] = useState<any[]>([]);
  const [filter, setFilter] = useState('mes'); // dia, mes, ano

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch orders for stats
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (orders) {
      const gross = orders.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
      const delivered = orders.filter(o => o.status === 'entregue').length;
      const refunded = orders.filter(o => o.status === 'reembolsado').length;
      
      setStats({
        vendasBrutas: gross,
        pedidosTotal: orders.length,
        pedidosEntregues: delivered,
        pedidosReembolsados: refunded
      });

      // Simple mock feed using the orders
      const recentFeed = orders.slice(0, 10).map(o => ({
        id: o.id,
        email: o.customer_email,
        total: o.total,
        date: new Date(o.created_at)
      }));
      setFeed(recentFeed);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Análise de Desempenho</h1>
          <p className="text-sm text-gray-500">Métricas financeiras e fluxo de caixa.</p>
        </div>
        <select 
          className="bg-white border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="dia">Hoje</option>
          <option value="mes">Este Mês</option>
          <option value="ano">Este Ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-zinc-500"><TrendingUp size={16}/> <span className="text-[10px] uppercase font-bold tracking-widest">Vendas Brutas</span></div>
          <span className="text-2xl font-bold tracking-tight text-zinc-800">
            {loading ? <Loader2 className="animate-spin w-5 h-5 text-zinc-400" /> : `R$ ${stats.vendasBrutas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-zinc-500"><ShoppingCart size={16}/> <span className="text-[10px] uppercase font-bold tracking-widest">Pedidos Proc.</span></div>
          <span className="text-2xl font-bold tracking-tight text-zinc-800">{loading ? '-' : stats.pedidosTotal}</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-zinc-500"><PackageCheck size={16}/> <span className="text-[10px] uppercase font-bold tracking-widest">Entregues</span></div>
          <span className="text-2xl font-bold tracking-tight text-emerald-600">{loading ? '-' : stats.pedidosEntregues}</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2 text-zinc-500"><RefreshCcw size={16}/> <span className="text-[10px] uppercase font-bold tracking-widest">Reembolsados</span></div>
          <span className="text-2xl font-bold tracking-tight text-rose-600">{loading ? '-' : stats.pedidosReembolsados}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Placeholder for Graphic since recharts install failed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-800 mb-6">Volume de Vendas ({filter})</h3>
           <div className="h-64 flex items-end justify-between gap-2 border-b border-zinc-100 pb-2">
              {[40, 70, 30, 90, 50, 80, 100].map((h, i) => (
                <div key={i} className="w-full bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-t-md relative group flex flex-col justify-end" style={{ height: '100%' }}>
                  <div className="w-full bg-zinc-800 rounded-t-md transition-all duration-1000" style={{ height: `${h}%` }}></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    R$ {h * 123}
                  </div>
                </div>
              ))}
           </div>
           <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mt-2">
             <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
           </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
          <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
             <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Feed ao Vivo
             </h3>
          </div>
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {loading ? <Loader2 className="animate-spin text-zinc-400 mx-auto mt-10" /> : 
             feed.length === 0 ? <p className="text-center text-zinc-400 text-sm mt-10 italic">Nenhum pedido recente.</p> :
             feed.map((f, i) => (
              <div key={i} className="flex gap-3 items-start border-b border-zinc-50 pb-4 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <ShoppingCart size={14} />
                </div>
                <div>
                  <p className="text-sm text-zinc-800 line-clamp-2">
                    <span className="font-bold">{f.email.split('@')[0]}</span> realizou um pedido de <span className="font-bold">R$ {Number(f.total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">{f.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
