"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Credenciais inválidas. Tente novamente.");
      setLoading(false);
    } else {
      router.push('/conta');
    }
  };

  return (
    <div className="min-h-screen bg-[#191A21] flex flex-col items-center justify-center p-6 text-white font-['Helvetica',_sans-serif]">
      <div className="w-full max-w-md bg-[#242628] border border-zinc-800 p-10 shadow-2xl relative">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <img 
              src="https://github.com/legendragon03453-dot/loja-jessyk/blob/main/LOGO%20LOJA.webp?raw=true" 
              alt="JESSYK" 
              className="h-8 object-contain"
            />
          </Link>
        </div>

        <h1 className="text-xl tracking-widest uppercase font-light text-center mb-8 text-[#A9AFDE]">
          Acesso ao Acervo
        </h1>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-900 text-rose-500 text-xs text-center p-3 mb-6 tracking-wide">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">E-mail</label>
            <input 
              required
              type="email"
              className="w-full bg-transparent border-b border-zinc-700 py-2 text-sm text-white outline-none focus:border-[#A9AFDE] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Senha</label>
            <input 
              required
              type="password"
              className="w-full bg-transparent border-b border-zinc-700 py-2 text-sm text-white outline-none focus:border-[#A9AFDE] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#A9AFDE] hover:text-white transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>Entrar <ArrowRight size={16}/></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] tracking-widest uppercase text-zinc-500">
          <p>Não possui acesso?</p>
          <Link href="/register" className="text-[#A9AFDE] hover:text-white mt-1 inline-block transition-colors font-bold border-b border-[#A9AFDE]/30 pb-0.5">
            Solicite sua credencial
          </Link>
        </div>
      </div>
    </div>
  );
}
