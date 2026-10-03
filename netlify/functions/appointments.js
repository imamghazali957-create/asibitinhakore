// netlify/functions/appointments.js
const { supabase } = require('./_supabase');

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '60602356Dc';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});

  const adminKey = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const required = ['patientName', 'phone', 'clinicId', 'date', 'time', 'reason'];
      for (const k of required) {
        if (!body[k]) return json(400, { ok: false, error: `Missing field: ${k}` });
      }

      const { data: clinic, error: cErr } = await supabase
        .from('clinics').select('name').eq('id', body.clinicId).single();
      if (cErr) throw cErr;

      const row = {
        patient_name: body.patientName.trim(),
        phone: body.phone.trim(),
        email: (body.email || '').trim(),
        age: (body.age || '').toString().trim(),
        clinic_id: body.clinicId,
        clinic_name: clinic.name,
        date: body.date,
        time: body.time,
        reason: body.reason,
        message: (body.message || '').trim(),
        status: 'pending'
      };

      const { data, error } = await supabase.from('appointments').insert(row).select().single();
      if (error) throw error;
      return json(201, { ok: true, appointment: data });
    }

    if (event.httpMethod === 'GET') {
      if (adminKey !== ADMIN_PASSCODE) return json(401, { ok: false, error: 'Unauthorized' });

      const { data, error } = await supabase
        .from('appointments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return json(200, { ok: true, appointments: data });
    }

    return json(405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('appointments function error:', err);
    return json(500, { ok: false, error: err.message || 'Server error' });
  }
};
