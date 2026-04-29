import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export function CategoriesTab() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setAdding(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await supabase.from('categories').insert([{ name, slug }]);
    if (!error) {
      setName('');
      fetchCategories();
    } else {
      alert("Erro ao adicionar categoria.");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar categoria?")) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchCategories();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Categorias</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-800 mb-4 flex items-center gap-2"><Plus size={16}/> Nova Categoria</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome</label>
              <input required type="text" placeholder="Ex: Bolsas de Luxo" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-800" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <button type="submit" disabled={adding} className="w-full bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50">
              {adding ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Salvar Categoria'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug URL</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-zinc-400" /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-sm text-zinc-400 italic">Nenhuma categoria cadastrada.</td></tr>
              ) : categories.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-4 font-bold text-zinc-800 text-sm">{c.name}</td>
                  <td className="px-6 py-4 text-zinc-500 text-sm font-mono">{c.slug}</td>
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
