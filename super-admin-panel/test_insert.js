import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urzxfvhyccxkkcqbyttx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhmdmh5Y2N4a2tjcWJ5dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTU1MTcsImV4cCI6MjA5OTQzMTUxN30.LT_13YxAnQKi2ODXBhcYwd0Ief7sFKmaAdEV9xL3izI';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabaseClient.from('orders').insert({
        customer_name: 'Teste',
        customer_phone: '123456789',
        delivery_address: 'Rua Teste',
        items: [{ id: '53335bc5-1aea-4ad2-b7cf-2dcdda3c5aec', name: 'Heineken Long Neck 330ml', quantity: 1, price: 10 }],
        total: 10,
        status: 'Pendente',
        tenant_id: '1b68d0b5-78cc-4f2a-8123-85c01714d34e'
    });
    console.log('Error:', error);
    console.log('Data:', data);
}
test();
