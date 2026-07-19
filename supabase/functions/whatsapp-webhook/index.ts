import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Evolution API Webhook Payload typical structure
// { "instance": "loja1", "data": { "key": { "remoteJid": "5511999999999@s.whatsapp.net", "fromMe": false }, "message": { "conversation": "Tem heineken?" } } }

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const body = await req.json()
    console.log("Webhook received:", JSON.stringify(body))

    // Validar se é uma mensagem de texto recebida e não enviada por nós
    if (!body.data || !body.data.message || body.data.key?.fromMe) {
      return new Response("Ignorado", { status: 200 })
    }

    const instanceName = body.instance
    const remoteJid = body.data.key.remoteJid
    
    // Extrair texto da mensagem (pode estar em conversation ou extendedTextMessage.text)
    const textMessage = body.data.message.conversation || body.data.message.extendedTextMessage?.text
    if (!textMessage) {
      return new Response("Sem texto", { status: 200 })
    }

    // 1. Buscar configurações do Lojista
    const { data: tenantInteg, error: integError } = await supabase
      .from('tenant_integrations')
      .select('tenant_id, openai_api_key, ai_system_prompt, whatsapp_instance_key')
      .eq('whatsapp_instance_name', instanceName)
      .single()

    if (integError || !tenantInteg || !tenantInteg.openai_api_key) {
      console.error("Lojista não encontrado ou sem chave OpenAI configurada para instância:", instanceName)
      return new Response("Not configured", { status: 200 })
    }

    // 2. Chamar a OpenAI (ChatGPT)
    const openAiPayload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: tenantInteg.ai_system_prompt || "Você é um assistente virtual útil." },
        { role: "user", content: textMessage }
      ],
      max_tokens: 150
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tenantInteg.openai_api_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(openAiPayload)
    })

    const openaiData = await openaiRes.json()
    const replyText = openaiData.choices?.[0]?.message?.content

    if (!replyText) {
      console.error("Erro ao gerar resposta na OpenAI", openaiData)
      return new Response("OpenAI Error", { status: 500 })
    }

    // 3. Enviar resposta de volta pelo WhatsApp (Evolution API)
    // A URL da Evolution API deve estar configurada nas variáveis de ambiente do Supabase
    const evoApiUrl = Deno.env.get('EVOLUTION_API_URL') || "http://localhost:8080"
    
    const sendPayload = {
      number: remoteJid,
      text: replyText
    }

    const sendRes = await fetch(`${evoApiUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "apikey": tenantInteg.whatsapp_instance_key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sendPayload)
    })

    const sendData = await sendRes.json()
    console.log("Resposta enviada com sucesso!", sendData)

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("Erro Fatal no Webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
