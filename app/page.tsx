"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/useCartStore';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Dynamic Data
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);

  // Cart Store
  const { items, isCartOpen, toggleCart, addItem, removeItem } = useCartStore();
  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    // Fetch Products
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    };
    fetchProducts();

    // Scroll handler for header & video
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(err => console.log("Autoplay prevented:", err));
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <main className="w-full font-['Helvetica',_sans-serif]">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bacasime+Antique&display=swap');`}
      </style>

      {/* Header / Navegação */}
      <header className={`fixed top-0 left-0 z-50 w-full px-6 transition-all duration-300 flex items-center justify-between md:justify-center ${isScrolled ? 'py-4 bg-[#191A21]/95 backdrop-blur-md' : 'py-8 bg-transparent'}`}>
        
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <img 
            src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/LOGO%20LOJA.webp?raw=true" 
            alt="JESSYK Logo" 
            className="h-6 object-contain"
          />
        </div>

        <div className="hidden md:flex items-center w-full max-w-4xl lg:max-w-5xl mx-auto">
          <nav className="flex-1 flex justify-end gap-6 lg:gap-10 text-[#A9AFDE] text-sm tracking-widest font-light pr-10 lg:pr-14">
            <a href="#" className="hover:text-white transition-colors duration-300">ACERVO</a>
            <a href="#" className="hover:text-white transition-colors duration-300">LANÇAMENTOS</a>
            <a href="#" className="hover:text-white transition-colors duration-300">MANIFESTO</a>
          </nav>

          <div className="flex-shrink-0">
            <img 
              src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/LOGO%20LOJA.webp?raw=true" 
              alt="JESSYK Logo" 
              className={`object-contain transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'}`}
            />
          </div>

          <nav className="flex-1 flex justify-start items-center gap-6 lg:gap-10 text-[#A9AFDE] text-sm tracking-widest font-light pl-10 lg:pl-14">
            <a href="#" className="hover:text-white transition-colors duration-300">BUSCAR</a>
            <a href="#" className="hover:text-white transition-colors duration-300">ACESSO</a>
            <button onClick={toggleCart} className="hover:text-white transition-colors duration-300 flex items-center gap-2">
              SACOLA ({items.length})
            </button>
          </nav>
        </div>

        <div className="md:hidden flex items-center gap-4 z-50 ml-auto">
          <button onClick={toggleCart} className="text-[#A9AFDE] hover:text-white">
            <ShoppingBag size={24} />
          </button>
          <button 
            className="text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center space-y-8 md:hidden text-white tracking-widest font-light">
          <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>ACERVO</a>
          <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>LANÇAMENTOS</a>
          <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>MANIFESTO</a>
          <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>BUSCAR</a>
          <a href="#" className="text-xl hover:text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>ACESSO</a>
        </div>
      )}

      {/* Cart Slide-over */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleCart} />
          <div className="relative w-full max-w-md bg-[#191A21] h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white text-xl tracking-widest uppercase">Sacola de Curadoria</h2>
              <button onClick={toggleCart} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center tracking-widest uppercase mt-20">Sua sacola está vazia.</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 border border-white/5 bg-[#1F2029] p-4">
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-contain bg-white/5" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white text-sm tracking-widest uppercase truncate">{item.name}</h3>
                        <p className="text-[#A9AFDE] text-sm mt-1">{Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500 text-sm">Qtd: {item.quantity}</span>
                        <button onClick={() => removeItem(item.id)} className="text-red-500/80 hover:text-red-500 text-sm tracking-wider uppercase">
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#1F2029]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 tracking-widest uppercase text-sm">Total do Investimento</span>
                  <span className="text-white text-xl font-light">{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <button className="w-full bg-white text-black font-bold tracking-widest uppercase p-4 hover:bg-[#A9AFDE] transition-colors">
                  FINALIZAR AQUISIÇÃO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessão 1: Hero */}
      <section 
        ref={sectionRef}
        className="sticky top-0 w-full h-screen overflow-hidden z-0"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/Flowers_appearing_zoom_202604242027.webm?raw=true"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-16 md:bottom-24 left-0 w-full flex flex-col items-center justify-center z-10 px-4 text-center">
          <h1 className="text-[#A9AFDE] text-lg md:text-2xl lg:text-3xl font-light mb-2 drop-shadow-md">
            As <span className="font-bold text-white">BOLSAS</span> que você sempre <span className="font-bold text-white">SONHOU</span> AQUI!
          </h1>
          <a href="#acervo" className="text-white text-sm md:text-base font-bold tracking-widest uppercase border-b-2 border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-all duration-300">
            ADENTRE O ACERVO
          </a>
        </div>
      </section>

      {/* Sessão 2: Manifesto */}
      <section className="relative z-10 w-full min-h-screen bg-[#191A21] flex flex-col items-center justify-center py-24 px-6 text-center shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <img 
          src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/JESSYK%20V2%20LOGO.webp?raw=true" 
          alt="S2 Jessyk Logo" 
          className="h-24 md:h-36 object-contain mb-12 md:mb-16"
        />
        <div className="text-[#A9AFDE] text-lg md:text-xl max-w-2xl space-y-6 md:space-y-8 leading-relaxed" style={{ fontFamily: "'Bacasime Antique', serif" }}>
          <p>Não se trata de couro ou metal.</p>
          <p>Trata-se de entrar na sala e não precisar dizer uma única palavra.<br />A presença fala por você.</p>
          <p>Bem-vindo a Jessyk.</p>
        </div>
      </section>

      {/* Sessão 3: Produtos (Coleção em Destaque Dinâmica) */}
      <section id="acervo" className="relative z-10 w-full min-h-screen bg-[#D6D8EB] flex flex-col items-center justify-center py-24 px-6 shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <h2 className="text-[#191A21] text-2xl md:text-3xl font-normal tracking-wide uppercase mb-12 text-center">
          COLEÇÃO EM DESTAQUE
        </h2>
        
        {products.length === 0 ? (
          <p className="text-[#191A21] tracking-widest">O acervo está sendo preparado...</p>
        ) : (
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {products.slice(0, 4).map(product => (
              <div key={product.id} className="flex flex-col group w-full">
                <div className="aspect-square bg-white w-full flex items-center justify-center overflow-hidden mb-4 p-6 shadow-sm relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Add to Cart Button */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => addItem(product)}
                      className="bg-[#191A21] text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#A9AFDE] hover:text-black transition-colors"
                    >
                      Adicionar à Sacola
                    </button>
                  </div>
                </div>
                <h3 className="text-[#191A21] text-base md:text-lg font-normal tracking-widest uppercase mb-1 text-left truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm tracking-wide text-left">
                  {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sessão 4: Destaques com Hover */}
      <section className="relative z-10 w-full h-screen bg-[#191A21]">
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-0">
          <a href="#" className="group relative block overflow-hidden h-full w-full cursor-pointer">
            <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/Substitua_bolsa_segunda_202604240049%201_1x.webp?raw=true" alt="Louis Vuitton" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <h3 className="text-white text-2xl md:text-3xl font-light tracking-widest uppercase text-center px-4">Louis Vuitton</h3>
            </div>
          </a>
          <a href="#" className="group relative block overflow-hidden h-full w-full cursor-pointer">
            <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/substitua_imagem_por_202604240031%201_1x.webp?raw=true" alt="Prada" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <h3 className="text-white text-2xl md:text-3xl font-light tracking-widest uppercase text-center px-4">Prada</h3>
            </div>
          </a>
          <a href="#" className="group relative block overflow-hidden h-full w-full cursor-pointer">
            <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/Substitua_bolsa_preta_202604241547%201_1x.webp?raw=true" alt="YSL Saint Laurent" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <h3 className="text-white text-2xl md:text-3xl font-light tracking-widest uppercase text-center px-4">YSL Saint Laurent</h3>
            </div>
          </a>
        </div>
      </section>

      {/* Sessão 5: Mais Produtos (Dinâmica - Opcional mostrar do índice 4 em diante ou random) */}
      <section className="relative z-10 w-full min-h-screen bg-[#D6D8EB] flex flex-col items-center justify-center py-24 px-6 shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <h2 className="text-[#191A21] text-2xl md:text-3xl font-normal tracking-wide uppercase mb-12 text-center">MAIS DESEJADOS</h2>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {products.slice(0, 4).map(product => (
              <div key={`mais-${product.id}`} className="flex flex-col group w-full">
                <div className="aspect-square bg-white w-full flex items-center justify-center overflow-hidden mb-4 p-6 shadow-sm relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => addItem(product)}
                      className="bg-[#191A21] text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#A9AFDE] hover:text-black transition-colors"
                    >
                      Adicionar à Sacola
                    </button>
                  </div>
                </div>
                <h3 className="text-[#191A21] text-base md:text-lg font-normal tracking-widest uppercase mb-1 text-left truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm tracking-wide text-left">
                  {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
          ))}
        </div>
      </section>

      {/* Sessão 6: Banner Sobre as Marcas */}
      <section className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="w-full h-full">
          <img src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/Rectangle%208.webp?raw=true" alt="Bolsa Prada em cenário rústico" className="w-full h-full object-cover object-center" />
        </div>
        <div className="w-full h-full bg-[#5C6378] flex flex-col justify-center px-10 py-16 md:px-20 lg:px-28">
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-6" style={{ fontFamily: "'Bacasime Antique', serif" }}>
            Edições ilimitadas da Prada,<br />Louis Vuitton e YSL
          </h2>
          <p className="text-white/90 text-base md:text-lg font-light leading-relaxed mb-10 max-w-lg">
            Todos nossos produtos são fornecidos pelas próprias marcas, aonde vendemos esses produtos com toda produção pontual.
          </p>
          <a href="#" className="text-white text-sm font-bold tracking-widest uppercase border-b border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-colors w-max">
            SOBRE
          </a>
        </div>
      </section>

      {/* Sessão 8: Footer */}
      <footer className="relative z-10 w-full h-screen bg-[#3B3D4E] px-6 md:px-12 flex flex-col justify-center">
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
    </main>
  );
}
