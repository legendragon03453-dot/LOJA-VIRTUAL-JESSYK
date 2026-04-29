"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/useCartStore';
import { Menu, X, Plus, Minus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CartDrawer } from '@/app/components/CartDrawer';

export default function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { addItem, toggleCart } = useCartStore();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  // Mobile Menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (data) {
        setProduct(data);
      }
      setLoading(false);
    };
    
    fetchProduct();
  }, [params.id]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => prev === id ? null : id);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#D6D8EB]"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-[#D6D8EB] text-black">Produto não encontrado.</div>;
  }

  // Juntar a imagem de capa com as mídias adicionais
  const allImages = [product.image_url, ...(product.media_urls || [])].filter(Boolean);

  return (
    <div className="font-['Helvetica',_sans-serif] bg-[#D6D8EB] text-black min-h-screen antialiased">
      {/* Header / Navegação */}
      <header className="fixed top-0 left-0 z-50 w-full px-6 py-6 bg-[#191A21] flex items-center justify-between md:justify-center transition-all duration-300">
          
          {/* Logo Mobile */}
          <div className="md:hidden absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <Link href="/">
                <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/LOGO%20LOJA.webp?raw=true" alt="JESSYK Logo" className="h-6 object-contain" />
              </Link>
          </div>

          {/* Menu Completo (Desktop) */}
          <div className="hidden md:flex items-center w-full max-w-4xl lg:max-w-5xl mx-auto">
              <nav className="flex-1 flex justify-end gap-6 lg:gap-10 text-[#A9AFDE] text-sm tracking-widest font-light pr-10 lg:pr-14">
                  <Link href="/#acervo" className="hover:text-white transition-colors duration-300">ACERVO</Link>
                  <a href="#" className="hover:text-white transition-colors duration-300">LANÇAMENTOS</a>
                  <a href="#" className="hover:text-white transition-colors duration-300">MANIFESTO</a>
              </nav>

              <div className="flex-shrink-0">
                  <Link href="/">
                    <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/LOGO%20LOJA.webp?raw=true" alt="JESSYK Logo" className="h-8 object-contain" />
                  </Link>
              </div>

              <nav className="flex-1 flex justify-start gap-6 lg:gap-10 text-[#A9AFDE] text-sm tracking-widest font-light pl-10 lg:pl-14">
                  <Link href="/" className="hover:text-white transition-colors duration-300">BUSCAR</Link>
                  <Link href="/conta" className="hover:text-white transition-colors duration-300">ACESSO</Link>
                  <button onClick={toggleCart} className="hover:text-white transition-colors duration-300 uppercase">SACOLA</button>
              </nav>
          </div>

          {/* Menu Mobile Toggle */}
          <button className="md:hidden text-white z-50 ml-auto" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center space-y-8 md:hidden text-white tracking-widest font-light">
              <Link href="/#acervo" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>ACERVO</Link>
              <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>LANÇAMENTOS</a>
              <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>MANIFESTO</a>
              <Link href="/" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>BUSCAR</Link>
              <Link href="/conta" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>ACESSO</Link>
              <button className="text-xl hover:text-gray-400 uppercase" onClick={() => { setIsMobileMenuOpen(false); toggleCart(); }}>SACOLA</button>
          </div>
      )}

      <CartDrawer />

      {/* Ajustado pt-32 para dar espaço ao menu fixo */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pt-32 pb-20">
          
          {/* Grid Principal */}
          <div className="flex flex-col lg:flex-row gap-12 items-start relative">

              {/* LADO ESQUERDO: Imagens do Produto */}
              <div className="w-full lg:w-[60%] flex flex-col gap-6 lg:gap-10">
                  {allImages.map((img, idx) => (
                    <div key={idx} className="w-full bg-white aspect-[3/4] relative flex items-center justify-center p-8">
                        <img src={img} 
                             alt={`${product.name} - Imagem ${idx + 1}`} 
                             className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                  ))}
              </div>

              {/* LADO DIREITO: Informações (Efeito Sticky) */}
              <div className="w-full lg:w-[40%] lg:sticky lg:top-[20vh] lg:mt-12 flex flex-col gap-4">
                  
                  {/* Cabeçalho do Produto */}
                  <div className="flex flex-col gap-1">
                      <h1 className="font-bold text-base uppercase tracking-wide leading-snug">
                          {product.name}
                      </h1>
                      <span className="text-base font-normal">
                          BRL {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                  </div>

                  <hr className="border-black/20" />

                  {/* Descrição Principal */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      <p>{product.description}</p>
                  </div>

                  {/* Botão Adicionar ao Carrinho */}
                  <button 
                    onClick={() => { addItem(product); toggleCart(); }}
                    className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-300 py-4 text-sm font-bold uppercase tracking-widest mt-1 active:scale-95"
                  >
                      Adicionar ao carrinho
                  </button>

                  {/* Informações de Entrega */}
                  {(product.delivery_time || product.stock <= 0) && (
                    <div className="text-xs uppercase tracking-wide font-semibold mt-2 flex flex-col gap-1">
                        {product.delivery_time && <span>Prazo de entrega: {product.delivery_time}</span>}
                        <span className="text-black/60">Envio nacional/internacional</span>
                        {product.stock <= 0 && <span className="text-rose-600 mt-2">Sem estoque no momento</span>}
                    </div>
                  )}

                  {/* Acordeões de Informação Secundária */}
                  <div className="border-t border-black/20 mt-6">
                      
                      {/* Mais Detalhes */}
                      {product.details && (
                        <div className="border-b border-black/20">
                            <button onClick={() => toggleAccordion('detalhes')} className="w-full py-4 flex justify-between items-center text-left text-xs font-bold uppercase tracking-widest focus:outline-none hover:opacity-70">
                                Mais detalhes
                                <span className="text-lg font-light leading-none">{openAccordion === 'detalhes' ? '-' : '+'}</span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'detalhes' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="pb-5 text-sm leading-relaxed text-black/80 whitespace-pre-wrap">
                                    {product.details}
                                </div>
                            </div>
                        </div>
                      )}

                      {/* Envio e Devolução */}
                      <div className="border-b border-black/20">
                          <button onClick={() => toggleAccordion('envio')} className="w-full py-4 flex justify-between items-center text-left text-xs font-bold uppercase tracking-widest focus:outline-none hover:opacity-70">
                              Envio e devolução
                              <span className="text-lg font-light leading-none">{openAccordion === 'envio' ? '-' : '+'}</span>
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'envio' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="pb-5 text-sm leading-relaxed text-black/80">
                                  <p>Os custos de envio são calculados na finalização da compra. As devoluções podem ser solicitadas no prazo de 30 dias a partir da data de entrega. Produtos com sinais de uso não serão aceitos.</p>
                              </div>
                          </div>
                      </div>

                      {/* Atendimento ao Cliente */}
                      <div className="border-b border-black/20">
                          <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="w-full py-4 flex justify-between items-center text-left text-xs font-bold uppercase tracking-widest focus:outline-none hover:opacity-70">
                              Atendimento ao cliente
                              <ArrowUpRight size={16} />
                          </a>
                      </div>

                  </div>
              </div>

          </div>
      </main>

      {/* Footer Integrado */}
      <footer className="relative z-10 w-full py-24 md:h-screen bg-[#3B3D4E] px-6 md:px-12 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 items-center">
              
              <div className="flex justify-center md:justify-start md:pl-8">
                  <p className="text-white text-sm font-normal tracking-widest leading-loose uppercase text-center md:text-left">
                      ENVIAMOS PARA<br />TODO BRAZIL
                  </p>
              </div>

              <div className="flex justify-center">
                  <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/JESSYK%20V2%20LOGO.webp?raw=true" alt="Jessyk Monograma" className="h-24 md:h-28 object-contain" />
              </div>

              <div className="flex justify-center md:justify-end md:pr-8">
                  <nav className="flex flex-col space-y-5 text-white text-sm font-normal tracking-widest uppercase text-center md:text-left">
                      <a href="#" className="hover:text-[#A9AFDE] transition-colors duration-300">LANÇAMENTOS</a>
                      <a href="#" className="hover:text-[#A9AFDE] transition-colors duration-300">ACERVO</a>
                      <a href="#" className="hover:text-[#A9AFDE] transition-colors duration-300">MANIFESTO</a>
                      <a href="#" className="hover:text-[#A9AFDE] transition-colors duration-300">CATEGORIAS</a>
                  </nav>
              </div>

          </div>
      </footer>
    </div>
  );
}
