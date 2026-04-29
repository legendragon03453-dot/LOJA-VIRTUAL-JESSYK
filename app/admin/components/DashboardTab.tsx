import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Globe, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export function DashboardTab({ setActiveTab, setIsModalOpen }: { setActiveTab: (t: string) => void, setIsModalOpen: (o: boolean) => void }) {
  const supabase = createClient();
  const [stats, setStats] = useState({
    totalSales: 0,
    visits: 0,
    orders: 0,
    products: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch total sales and orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total');
        
        if (!ordersError && ordersData) {
          const total = ordersData.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
          setStats(s => ({ ...s, totalSales: total, orders: ordersData.length }));
        }

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (!productsError && productsCount !== null) {
          setStats(s => ({ ...s, products: productsCount }));
        }

        // Fetch visits
        const { count: visitsCount, error: visitsError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true });
        
        if (!visitsError && visitsCount !== null) {
          setStats(s => ({ ...s, visits: visitsCount }));
        }

      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Bom dia, Admin</h1>
          <p className="text-sm text-gray-500">Veja o resumo de performance da Jessyk hoje.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('config')} className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95">Configurar</button>
          <a href="/" target="_blank" rel="noreferrer" className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm active:scale-95 shadow-black/10 text-center inline-block">Ver Loja</a>
        </div>
      </header>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Vendas Totais</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold tracking-tight text-zinc-800">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-zinc-400" /> : `R$ ${stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-[10px] font-bold flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full text-emerald-600">
              <TrendingUp size={10} />
            </span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Visitas (Total)</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold tracking-tight text-zinc-800">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-zinc-400" /> : stats.visits}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Pedidos Realizados</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold tracking-tight text-zinc-800">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-zinc-400" /> : stats.orders}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Produtos da Loja</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold tracking-tight text-zinc-800">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-zinc-400" /> : stats.products}
            </span>
          </div>
        </div>
      </div>

      {/* Cards de Boas-Vindas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-zinc-300 transition-all group">
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-lg mb-1 text-zinc-900">Cadastre seus produtos</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">Prepare o acervo luxuoso da Jessyk com novas peças exclusivas.</p>
            <button 
              onClick={() => { setActiveTab('produtos'); setIsModalOpen(true); }}
              className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              Adicionar Produto
            </button>
          </div>
          <div className="w-24 h-24 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 group-hover:scale-105 transition-transform duration-300 shadow-inner">
            <Package className="text-zinc-200" size={48} />
          </div>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-zinc-300 transition-all group">
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-lg mb-1 text-zinc-900">Personalize o Design</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">Ajuste a experiência visual e cores da sua loja.</p>
            <button onClick={() => setActiveTab('config')} className="bg-white border border-gray-300 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95">Editar Tema</button>
          </div>
          <div className="w-24 h-24 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 group-hover:scale-105 transition-transform duration-300 shadow-inner">
            <Globe className="text-zinc-200" size={48} />
          </div>
        </div>
      </div>
    </div>
  );
}
