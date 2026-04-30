import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    
    // Na Azirt, você deve monitorar esses eventos principais
    const { status, external_id } = body;

    if (status === 'approved' || status === 'paid') {
      const { error } = await supabase
        .from('orders') // Certifique-se que o nome da tabela no Supabase é 'orders'
        .update({ status: 'pago' })
        .eq('id', external_id);

      if (error) throw error;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Erro no Webhook:', err);
    return new NextResponse('Webhook Error', { status: 400 });
  }
}