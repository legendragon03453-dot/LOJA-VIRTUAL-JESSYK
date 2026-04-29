import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Utilizamos placeholders caso as chaves não existam no momento do build da Vercel
  // Isso evita que o build quebre (prerendering error)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

  return createBrowserClient(supabaseUrl, supabaseKey)
}
