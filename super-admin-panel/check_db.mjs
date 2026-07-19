const url = 'https://urzxfvhyccxkkcqbyttx.supabase.co/rest/v1/invoices?select=id,tenant_id,payment_link';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhmdmh5Y2N4a2tjcWJ5dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTU1MTcsImV4cCI6MjA5OTQzMTUxN30.LT_13YxAnQKi2ODXBhcYwd0Ief7sFKmaAdEV9xL3izI';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
