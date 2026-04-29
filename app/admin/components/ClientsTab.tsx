import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Search, ShoppingBag } from 'lucide-react';

export function ClientsTab() {
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  };

  const filtered = clients.filter(c => c.email.toLowerCase().includes(search.toLowerCase()) || c.phone_whatsapp?.includes(search));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Clientes</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar por email ou tel..." 
            className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-zinc-800 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp/Tel</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Carrinho Ativo</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Cadastrado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Carregando...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-400 italic text-sm">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((client) => {
                const cartItems = Object.keys(client.cart_state || {}).length;
                return (
                  <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-sm text-zinc-900">{client.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{client.phone_whatsapp || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cartItems > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-zinc-100 text-zinc-500'}`}>
                        <ShoppingBag size={12} /> {cartItems} itens
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-right text-zinc-500 tabular-nums">
                      {new Date(client.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
