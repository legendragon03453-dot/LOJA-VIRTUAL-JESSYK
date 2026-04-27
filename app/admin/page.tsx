"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, Plus, Package, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    if (error) console.error("Erro ao buscar produtos:", error);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            name,
            description,
            price: parseFloat(price),
            category,
            image_url: imageUrl,
          }
        ]);

      if (insertError) throw insertError;

      // Limpar form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      setPreviewUrl(null);
      
      alert("Produto adicionado ao Acervo!");
      fetchProducts();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;
    
    // Deletar a imagem do storage (opcional, mas boa prática)
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('product-images').remove([fileName]);
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert("Erro ao deletar: " + error.message);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-[#191A21] text-white p-8 font-['Helvetica',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Formulário de Adição */}
        <div className="lg:col-span-1 bg-[#1F2029] p-8 rounded-sm shadow-2xl border border-white/5 h-fit">
          <h2 className="text-2xl font-light tracking-widest uppercase mb-8 flex items-center gap-3">
            <Plus size={24} className="text-[#A9AFDE]" />
            Novo Produto
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 tracking-wide uppercase">Nome da Peça</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#191A21] border border-white/10 rounded-none p-3 text-white focus:outline-none focus:border-[#A9AFDE] transition-colors"
                placeholder="Ex: PRADA XLW"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 tracking-wide uppercase">Preço (BRL)</label>
              <input 
                required
                type="number" 
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#191A21] border border-white/10 rounded-none p-3 text-white focus:outline-none focus:border-[#A9AFDE] transition-colors"
                placeholder="Ex: 3000.00"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 tracking-wide uppercase">Categoria (Marca)</label>
              <select 
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#191A21] border border-white/10 rounded-none p-3 text-white focus:outline-none focus:border-[#A9AFDE] transition-colors"
              >
                <option value="">Selecione...</option>
                <option value="Prada">Prada</option>
                <option value="Louis Vuitton">Louis Vuitton</option>
                <option value="YSL">YSL</option>
                <option value="Hermes">Hermès</option>
                <option value="Dior">Dior</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 tracking-wide uppercase">Imagem do Produto</label>
              <div className="relative border-2 border-dashed border-white/10 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#A9AFDE] transition-colors group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-32 object-contain" />
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <Upload size={32} className="text-gray-500 mb-2 group-hover:text-[#A9AFDE] transition-colors" />
                    <span className="text-sm text-gray-500 group-hover:text-white transition-colors">Clique ou arraste a foto</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-bold tracking-widest uppercase p-4 hover:bg-[#A9AFDE] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Salvando...' : 'Adicionar ao Acervo'}
            </button>
          </form>
        </div>

        {/* Lista de Produtos */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-light tracking-widest uppercase mb-8 flex items-center gap-3">
            <Package size={24} className="text-[#A9AFDE]" />
            Acervo Atual ({products.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-[#1F2029] border border-white/5 group relative overflow-hidden">
                <div className="h-48 bg-white/5 flex items-center justify-center p-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <ImageIcon size={48} className="text-gray-600" />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs text-[#A9AFDE] tracking-widest uppercase">{product.category}</span>
                  <h3 className="text-lg font-normal tracking-wider uppercase mt-1 mb-2 truncate">{product.name}</h3>
                  <p className="text-gray-400 font-light">{Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                
                {/* Delete Button overlay */}
                <button 
                  onClick={() => handleDelete(product.id, product.image_url)}
                  className="absolute top-4 right-4 bg-red-500/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ))}

            {products.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10">
                O acervo está vazio. Adicione seu primeiro produto.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
