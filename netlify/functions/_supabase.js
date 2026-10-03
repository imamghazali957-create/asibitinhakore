// netlify/functions/_supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== SUPABASE DEBUG START ===');
console.log('URL:', supabaseUrl);
console.log('KEY prefix:', String(serviceKey || '').slice(0, 15));
console.log('KEY length:', String(serviceKey || '').length);
console.log('KEY contains role:', String(serviceKey || '').includes('service_role'));
console.log('=== SUPABASE DEBUG END ===');

if (!supabaseUrl || !serviceKey) {
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

module.exports = { supabase };
