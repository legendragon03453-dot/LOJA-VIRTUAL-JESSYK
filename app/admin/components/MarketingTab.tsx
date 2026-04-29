import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export function MarketingTab() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percentage: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const { error } = await supabase.from('coupons').insert([{
      code: newCoupon.code.toUpperCase(),
      discount_percentage: parseFloat(newCoupon.discount_percentage)
    }]);
    
    if (!error) {
      setNewCoupon({ code: '', discount_percentage: '' });
      fetchCoupons();
    } else {
      alert("Erro ao adicionar cupom. Verifique se o código já existe.");
    }
    setAdding(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('coupons').update({ active: !currentStatus }).eq('id', id);
    if (!error) fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este cupom?")) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) fetchCoupons();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Marketing</h1>
          <p className="text-sm text-gray-500">Gerencie seus cupons de desconto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-800 mb-4 flex items-center gap-2"><Plus size={16}/> Novo Cupom</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Código</label>
              <input required type="text" placeholder="Ex: VERAO20" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm uppercase outline-none focus:border-zinc-800" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Desconto (%)</label>
              <input required type="number" placeholder="Ex: 15" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-800" value={newCoupon.discount_percentage} onChange={e => setNewCoupon({...newCoupon, discount_percentage: e.target.value})} />
            </div>
            <button type="submit" disabled={adding} className="w-full bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50">
              {adding ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Criar Cupom'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Desconto</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-zinc-400" /></td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-sm text-zinc-400 italic">Nenhum cupom ativo.</td></tr>
              ) : coupons.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-4 font-bold font-mono text-zinc-800 text-sm">{c.code}</td>
                  <td className="px-6 py-4 font-bold text-right text-emerald-600 text-sm">{c.discount_percentage}%</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleActive(c.id, c.active)} className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
