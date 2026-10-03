// netlify/functions/clinics.js
const { supabase } = require('./_supabase');

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '60602356Dc';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});

  const id = event.queryStringParameters?.id;
  const adminKey = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return json(200, { ok: true, clinics: data });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const required = ['name', 'phone', 'whatsapp', 'state', 'address', 'hours'];
      for (const k of required) {
        if (!body[k]) return json(400, { ok: false, error: `Missing field: ${k}` });
      }

      const row = {
        name: body.name.trim(),
        owner_name: (body.ownerName || '').trim(),
        phone: body.phone.trim(),
        whatsapp: body.whatsapp.trim(),
        email: (body.email || '').trim(),
        state: body.state.trim(),
        city: (body.city || '').trim(),
        address: body.address.trim(),
        hours: body.hours.trim(),
        services: Array.isArray(body.services)
          ? body.services
          : String(body.services || '').split(',').map(s => s.trim()).filter(Boolean),
        emergency: !!body.emergency,
        verified: false,
        status: 'pending',
        image: (body.image || '').trim(),
        maps_url: (body.mapsUrl || '').trim(),
        description: (body.description || '').trim(),
        is_247: /24\s*(hour|\/7)/i.test(body.hours || '')
      };

      const { data, error } = await supabase.from('clinics').insert(row).select().single();
      if (error) throw error;
      return json(201, { ok: true, clinic: data });
    }

    if (event.httpMethod === 'PATCH') {
      if (adminKey !== ADMIN_PASSCODE) return json(401, { ok: false, error: 'Unauthorized' });
      if (!id) return json(400, { ok: false, error: 'Missing id' });

      const body = JSON.parse(event.body || '{}');
      const patch = {};
      const allowed = ['name','owner_name','phone','whatsapp','email','state','city',
                       'address','hours','services','emergency','verified','status','image',
                       'maps_url','description','is_247'];
      for (const k of allowed) {
        if (k in body) patch[k] = body[k];
      }
      patch.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('clinics').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return json(200, { ok: true, clinic: data });
    }

    if (event.httpMethod === 'DELETE') {
      if (adminKey !== ADMIN_PASSCODE) return json(401, { ok: false, error: 'Unauthorized' });
      if (!id) return json(400, { ok: false, error: 'Missing id' });

      const { error } = await supabase.from('clinics').delete().eq('id', id);
      if (error) throw error;
      return json(200, { ok: true });
    }

    return json(405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('clinics function error:', err);
    return json(500, { ok: false, error: err.message || 'Server error' });
  }
};
