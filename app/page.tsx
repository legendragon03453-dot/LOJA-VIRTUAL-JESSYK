"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingBag, Search, SlidersHorizontal, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();
  
  // Dynamic Data
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);

  // Auth State
  const [user, setUser] = useState<any>(null);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(''); // Brand filter

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

    // Check Auth
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

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

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user has address
    const { data } = await supabase.from('clients').select('address, zip_code').eq('id', user.id).single();
    if (!data || !data.address || !data.zip_code) {
      alert('Por favor, preencha seu Endereço de Entrega na aba "Minha Conta" antes de finalizar a compra.');
      router.push('/conta');
    } else {
      // Proceed to checkout logic
      alert('Redirecionando para o pagamento seguro...');
    }
  };

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
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-white transition-colors duration-300 uppercase">BUSCAR</button>
            <Link href={user ? "/conta" : "/login"} className="hover:text-white transition-colors duration-300 uppercase">
              {user ? "MINHA CONTA" : "ACESSO"}
            </Link>
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
          <button className="text-xl hover:text-gray-400 uppercase" onClick={() => {setIsMobileMenuOpen(false); setIsSearchOpen(true);}}>BUSCAR</button>
          <Link href={user ? "/conta" : "/login"} className="text-xl hover:text-gray-400 uppercase" onClick={() => setIsMobileMenuOpen(false)}>
            {user ? "MINHA CONTA" : "ACESSO"}
          </Link>
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
                <button onClick={handleCheckout} className="w-full bg-white text-black font-bold tracking-widest uppercase p-4 hover:bg-[#A9AFDE] transition-colors">
                  FINALIZAR AQUISIÇÃO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Full Screen Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70] bg-[#191A21] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/10">
            <div className="flex-1 max-w-4xl mx-auto flex items-center gap-4">
              <Search className="text-[#A9AFDE]" size={28} />
              <input 
                autoFocus
                type="text" 
                placeholder="O que você está procurando?" 
                className="w-full bg-transparent border-none text-white text-xl md:text-3xl font-light outline-none placeholder:text-gray-600"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={32} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Filtros Lateral */}
            <div className="space-y-8 md:border-r border-white/10 md:pr-8">
              <div>
                <h3 className="text-white text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2"><SlidersHorizontal size={16}/> Filtros</h3>
              </div>
              
              <div className="space-y-4">
                <label className="text-[#A9AFDE] text-xs font-bold tracking-widest uppercase block">Marca</label>
                <input 
                  type="text" 
                  placeholder="Ex: Prada, Gucci..." 
                  className="w-full bg-[#242628] border border-zinc-800 rounded-md px-4 py-3 text-sm text-white outline-none focus:border-[#A9AFDE]"
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[#A9AFDE] text-xs font-bold tracking-widest uppercase block">Categoria / Tag</label>
                <input 
                  type="text" 
                  placeholder="Ex: Bolsas, Verão..." 
                  className="w-full bg-[#242628] border border-zinc-800 rounded-md px-4 py-3 text-sm text-white outline-none focus:border-[#A9AFDE]"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[#A9AFDE] text-xs font-bold tracking-widest uppercase block">Preço (R$)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full bg-[#242628] border border-zinc-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#A9AFDE]"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                  />
                  <span className="text-gray-500">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full bg-[#242628] border border-zinc-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#A9AFDE]"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="md:col-span-3">
              <h3 className="text-white text-sm font-light tracking-widest uppercase mb-6">Resultados</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter(p => {
                  const matchQuery = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchBrand = !selectedBrand || p.name.toLowerCase().includes(selectedBrand.toLowerCase()) || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(selectedBrand.toLowerCase())));
                  const matchCategory = !selectedCategory || (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())) || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(selectedCategory.toLowerCase())));
                  const matchMin = !priceMin || p.price >= parseFloat(priceMin);
                  const matchMax = !priceMax || p.price <= parseFloat(priceMax);
                  return matchQuery && matchBrand && matchCategory && matchMin && matchMax;
                }).slice(0, 12).map(product => (
                  <div key={`search-${product.id}`} className="group flex flex-col">
                    <div className="aspect-square bg-white w-full flex items-center justify-center p-4 relative overflow-hidden">
                       <Link href={`/produto/${product.id}`} onClick={() => setIsSearchOpen(false)}>
                         <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                       </Link>
                       <div className="absolute inset-0 pointer-events-none bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Link href={`/produto/${product.id}`} onClick={() => setIsSearchOpen(false)} className="bg-white pointer-events-auto text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#A9AFDE] hover:text-white transition-colors">
                            Ver Peça
                          </Link>
                       </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-white text-sm tracking-widest uppercase truncate">{product.name}</h4>
                      <p className="text-[#A9AFDE] text-sm mt-1">{Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  <Link href={`/produto/${product.id}`}>
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {/* Hover Actions */}
                  <div className="absolute inset-0 pointer-events-none bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={(e) => { e.preventDefault(); addItem(product); toggleCart(); }}
                      className="bg-[#191A21] pointer-events-auto text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#A9AFDE] hover:text-black transition-colors"
                    >
                      + Sacola
                    </button>
                    <Link 
                      href={`/produto/${product.id}`}
                      className="bg-white pointer-events-auto text-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#A9AFDE] hover:text-white transition-colors border border-black"
                    >
                      Ver Peça
                    </Link>
                  </div>
                </div>
                <Link href={`/produto/${product.id}`} className="hover:text-[#A9AFDE] transition-colors">
                  <h3 className="text-[#191A21] text-base md:text-lg font-normal tracking-widest uppercase mb-1 text-left truncate">
                    {product.name}
                  </h3>
                </Link>
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
