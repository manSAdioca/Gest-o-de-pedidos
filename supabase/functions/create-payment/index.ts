import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const body = await req.json()
    const { tenant_id, items, customer, back_urls } = body

    if (!tenant_id || !items || items.length === 0) {
      throw new Error("Parâmetros inválidos")
    }

    // Buscar o Access Token do Mercado Pago do lojista
    const { data: tenantInteg, error: integError } = await supabase
      .from('tenant_integrations')
      .select('mp_access_token')
      .eq('tenant_id', tenant_id)
      .single()

    if (integError || !tenantInteg || !tenantInteg.mp_access_token) {
      throw new Error("Lojista não tem Mercado Pago configurado")
    }

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: items.map((item: any) => ({
        title: item.name,
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      payer: {
        name: customer?.name || "Cliente Anonimo",
        email: customer?.email || "email@teste.com"
      },
      back_urls: back_urls || {
        success: "https://distribuidoraimperatriz.com.br/sucesso",
        failure: "https://distribuidoraimperatriz.com.br/falha",
        pending: "https://distribuidoraimperatriz.com.br/pendente"
      },
      auto_return: "approved"
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tenantInteg.mp_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    });

    const mpResult = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Erro MP:", mpResult);
      throw new Error("Falha ao gerar pagamento no Mercado Pago");
    }

    return new Response(
      JSON.stringify({ init_point: mpResult.init_point, id: mpResult.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
