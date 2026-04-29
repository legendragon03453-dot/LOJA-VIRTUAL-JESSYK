import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Shield } from 'lucide-react';

export function TeamManagementTab() {
  const supabase = createClient();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    // Idealmente, a busca deveria dar um JOIN com auth.users, mas como não temos acesso direto à view auth.users pelo client em muitos setups, 
    // a tabela user_roles deve ser enriquecida com email através de triggers no backend, ou via RPC.
    // Para efeito de demonstração do layout, listaremos as roles
    const { data } = await supabase.from('user_roles').select('*');
    if (data) setTeam(data);
    setLoading(false);
  };

  const updateRole = async (id: string, newRole: string) => {
    await supabase.from('user_roles').update({ role: newRole }).eq('id', id);
    fetchTeam();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Shield size={20} className="text-emerald-600"/> Gestão de Acessos
          </h1>
          <p className="text-sm text-gray-500">Área restrita ao CEO. Gerencie as permissões da equipe.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Cargo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={2} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-zinc-400" /></td></tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={2} className="p-8 text-center text-sm text-zinc-400 italic">Nenhum membro cadastrado em user_roles.</td></tr>
            ) : team.map(member => (
              <tr key={member.id}>
                <td className="px-6 py-4 font-mono text-xs text-zinc-500">{member.id}</td>
                <td className="px-6 py-4 text-right">
                  <select 
                    className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-bold bg-zinc-50 outline-none focus:border-zinc-800"
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value)}
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="gerente">Gerente</option>
                    <option value="CEO">CEO</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
