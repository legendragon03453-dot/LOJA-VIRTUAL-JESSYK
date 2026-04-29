"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Megaphone, 
  Settings, 
  Search, 
  Tags,
  Shield,
  BarChart3,
  Loader2
} from 'lucide-react';

// Components
import { DashboardTab } from './components/DashboardTab';
import { ProductsTab } from './components/ProductsTab';
import { OrdersTab } from './components/OrdersTab';
import { ClientsTab } from './components/ClientsTab';
import { MarketingTab } from './components/MarketingTab';
import { CategoriesTab } from './components/CategoriesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { TeamManagementTab } from './components/TeamManagementTab';

export default function AdminPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fake Modal State for Dashboard cross-communication
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  // Auth / Role State
  const [userRole, setUserRole] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'legendragon03453@gmail.com') {
        router.push('/');
      } else {
        setUserRole('CEO');
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, [router, supabase]);

  const SidebarItem = ({ id, icon: Icon, label, restrictCEO = false }: { id: string, icon: any, label: string, restrictCEO?: boolean }) => {
    if (restrictCEO && userRole !== 'CEO') return null;
    
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          activeTab === id 
          ? 'bg-white shadow-sm text-black border border-gray-200' 
          : 'text-gray-500 hover:bg-gray-200/50 hover:text-black'
        }`}
      >
        <Icon size={18} />
        {label}
      </button>
    );
  }

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f6f6f7]"><Loader2 className="animate-spin text-zinc-400"/></div>
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f7] font-sans text-[#1a1c1d]">
      
      {/* Sidebar - Shopify Polaris Style */}
      <aside className="w-64 bg-[#ebebed] border-r border-gray-200 flex flex-col p-4 fixed h-full z-40">
        <div className="flex items-center gap-2 px-2 mb-8 select-none">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs shadow-inner">J</div>
          <span className="font-bold text-sm tracking-tight uppercase text-zinc-800">Jessyk Admin</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-hide">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 mt-4">Principal</p>
          <SidebarItem id="inicio" icon={LayoutDashboard} label="Início" />
          <SidebarItem id="pedidos" icon={ShoppingCart} label="Pedidos (Kanban)" />
          <SidebarItem id="produtos" icon={Package} label="Produtos" />
          <SidebarItem id="categorias" icon={Tags} label="Categorias" />
          <SidebarItem id="clientes" icon={Users} label="Clientes" />
          
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 mt-6">Crescimento</p>
          <SidebarItem id="marketing" icon={Megaphone} label="Marketing & Cupons" />
          <SidebarItem id="analises" icon={BarChart3} label="Análises" restrictCEO />
        </nav>

        <div className="pt-4 border-t border-gray-200 mt-4 space-y-1">
          <SidebarItem id="gestao" icon={Shield} label="Gestão de Equipe" restrictCEO />
          <SidebarItem id="config" icon={Settings} label="Configurações" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen bg-[#f6f6f7]">
        
        {/* Top Header - Global Search */}
        <header className="h-14 bg-[#1a1c1d] flex items-center justify-between px-8 sticky top-0 z-30 shadow-lg">
          <div className="flex-1 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Pesquisar..."
              className="w-full bg-[#2f3133] border-none rounded-md py-1.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-gray-600 placeholder-gray-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{userRole}</span>
                <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">J</div>
             </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeTab === 'inicio' && <DashboardTab setActiveTab={setActiveTab} setIsModalOpen={setIsModalOpen} />}
          {activeTab === 'produtos' && <ProductsTab setActiveTab={setActiveTab} />}
          {activeTab === 'pedidos' && <OrdersTab />}
          {activeTab === 'clientes' && <ClientsTab />}
          {activeTab === 'marketing' && <MarketingTab />}
          {activeTab === 'categorias' && <CategoriesTab />}
          {activeTab === 'analises' && <AnalyticsTab />}
          {activeTab === 'gestao' && <TeamManagementTab />}
          {activeTab === 'config' && (
            <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center">
              <Settings className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold">Configurações da Loja</h2>
              <p className="text-sm text-zinc-500">Em breve...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
