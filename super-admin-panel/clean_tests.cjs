
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanData() {
  try {
    console.log("Iniciando limpeza de testes...");

    // 1. Apagar itens de pedidos (para evitar erros de foreign key)
    console.log("Limpando itens de pedidos...");
    const { error: itemsError } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (itemsError) throw itemsError;

    // 2. Apagar pedidos
    console.log("Limpando pedidos...");
    const { error: ordersError } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (ordersError) throw ordersError;

    // 3. Apagar faturas
    console.log("Limpando faturas...");
    const { error: invoicesError } = await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (invoicesError) throw invoicesError;

    console.log("Limpeza concluída com sucesso! Todas as lojas foram mantidas.");
  } catch (error) {
    console.error("Erro durante a limpeza:", error.message || error);
  }
}

cleanData();
