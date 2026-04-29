import React, { useState, useEffect } from 'react';
import { Filter, Plus, Loader2, X, Package, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAlertStore } from '@/store/useAlertStore';

export function ProductsTab({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Product State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    featured: false,
    stock: '',
    discount_percentage: '',
    type: '',
    colors: '', // comma separated string for now
    tags: '', // comma separated string for now
    delivery_time: '',
    details: '',
    image: null as File | null,
    additionalMedia: [] as File[],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Erro ao buscar acervo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let mainImageUrl = '';
      if (newProduct.image) {
        const fileExt = newProduct.image.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, newProduct.image);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        mainImageUrl = data.publicUrl;
      }

      let mediaUrls: string[] = [];
      for (const file of newProduct.additionalMedia) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          mediaUrls.push(data.publicUrl);
        }
      }

      const colorsArray = newProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
      const tagsArray = newProduct.tags.split(',').map(t => t.trim()).filter(Boolean);

      const { error } = await supabase.from('products').insert([{ 
        name: newProduct.name, 
        description: newProduct.description, 
        price: parseFloat(newProduct.price),
        category: newProduct.category || null,
        featured: newProduct.featured,
        stock: parseInt(newProduct.stock) || 0,
        discount_percentage: parseFloat(newProduct.discount_percentage) || null,
        type: newProduct.type,
        colors: colorsArray,
        tags: tagsArray,
        delivery_time: newProduct.delivery_time,
        details: newProduct.details,
        image_url: mainImageUrl,
        media_urls: mediaUrls
      }]);

      if (error) throw error;

      setSuccessMsg("Produto adicionado com sucesso!");
      setIsModalOpen(false);
      setNewProduct({
        name: '', description: '', price: '', category: '', featured: false,
        stock: '', discount_percentage: '', type: '', colors: '', tags: '',
        delivery_time: '', details: '',
        image: null, additionalMedia: []
      });
      fetchProducts();
    } catch (err) {
      console.error("Erro no cadastro:", err);
      useAlertStore.getState().showAlert("Erro ao salvar produto.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    useAlertStore.getState().showConfirm("Deseja realmente deletar este produto?", async () => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        useAlertStore.getState().showAlert("Erro ao deletar produto.");
      } else {
        fetchProducts();
      }
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Acervo de Itens ({products.length})</h1>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={14} /> Filtros
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-zinc-800 transition-all uppercase tracking-widest active:scale-95"
          >
            <Plus size={16} /> Novo Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estoque</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Preço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sincronizando acervo...</p>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-400 italic">
                  O acervo está vazio. Clique em "Novo Item" para começar.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors group cursor-default">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                      <img src={product.image_url || 'https://via.placeholder.com/150'} className="max-w-full max-h-full object-contain" alt={product.name} />
                    </div>
                    <div>
                        <span className="font-bold text-sm block text-zinc-900">{product.name} {product.featured && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Destaque</span>}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-medium tracking-tighter">ID: {product.id?.slice(0,8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-700">{product.stock} un.</td>
                  <td className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">{product.category || '-'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-zinc-900 tabular-nums">
                    R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <header className="px-8 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-800">Cadastrar Nova Peça</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black transition-colors p-2 active:scale-95">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Título do Produto</label>
                    <input required className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-800" placeholder="Ex: Bolsa Prada" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Descrição Curta (Resumo)</label>
                    <textarea rows={2} className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-800 resize-none" placeholder="Detalhes..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Detalhes (Descrição Completa da Página)</label>
                    <textarea rows={4} className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-800 resize-none" placeholder="Tamanho, materiais, história da peça..." value={newProduct.details} onChange={(e) => setNewProduct({...newProduct, details: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Preço (R$)</label>
                    <input type="number" step="0.01" required className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Desconto (%) Opcional</label>
                    <input type="number" className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.discount_percentage} onChange={(e) => setNewProduct({...newProduct, discount_percentage: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Estoque (un)</label>
                    <input type="number" required className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Prazo de Entrega (Dias Úteis)</label>
                    <input type="text" placeholder="Ex: 15" className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.delivery_time} onChange={(e) => setNewProduct({...newProduct, delivery_time: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Categoria</label>
                    <input type="text" placeholder="Bolsas, Sapatos..." className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tipo</label>
                    <input type="text" placeholder="Físico ou Digital" className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.type} onChange={(e) => setNewProduct({...newProduct, type: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cores (separadas por vírgula)</label>
                    <input type="text" placeholder="Preto, Branco, Nude" className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.colors} onChange={(e) => setNewProduct({...newProduct, colors: e.target.value})} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tags (separadas por vírgula)</label>
                    <input type="text" placeholder="Luxo, Verão, Couro" className="w-full border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-zinc-800" value={newProduct.tags} onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})} />
                  </div>

                  <div className="col-span-2 flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    <input type="checkbox" id="featured" className="w-5 h-5 accent-black" checked={newProduct.featured} onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})} />
                    <label htmlFor="featured" className="text-sm font-bold text-zinc-800 cursor-pointer">Produto em Destaque?</label>
                  </div>

                  <div className="col-span-2 border-t border-zinc-100 pt-6">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Capa do Produto (Principal)</label>
                    <input type="file" className="text-sm w-full" onChange={(e) => setNewProduct({...newProduct, image: e.target.files?.[0] || null})} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Mídias Adicionais (Galeria)</label>
                    <input type="file" multiple className="text-sm w-full" onChange={(e) => {
                       if (e.target.files) {
                         setNewProduct({...newProduct, additionalMedia: Array.from(e.target.files)});
                       }
                    }} />
                  </div>

                </div>
              </div>
            </form>

            <footer className="px-8 py-6 border-t border-zinc-100 flex justify-end gap-4 bg-zinc-50/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descartar</button>
              <button onClick={handleAddProduct} disabled={uploading} className="bg-black text-white px-10 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50">
                {uploading ? <Loader2 className="animate-spin inline" size={14} /> : 'Salvar no Acervo'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
