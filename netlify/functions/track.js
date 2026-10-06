// netlify/functions/track.js
// Records clinic events: whatsapp, call, directions, booking.

const { supabase } = require('./_supabase');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});

  try {
    // POST: record a new event
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { clinicId, eventType } = body;

      if (!clinicId || !eventType) {
        return json(400, { ok: false, error: 'Missing clinicId or eventType' });
      }

      if (!['whatsapp','call','directions','booking'].includes(eventType)) {
        return json(400, { ok: false, error: 'Invalid eventType' });
      }

      const { error } = await supabase
        .from('clinic_events')
        .insert({ clinic_id: clinicId, event_type: eventType });

      if (error) throw error;
      return json(200, { ok: true });
    }

    // GET: return counts (admin only)
    if (event.httpMethod === 'GET') {
      const adminKey = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
      const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '60602356Dc';

      if (adminKey !== ADMIN_PASSCODE) {
        return json(401, { ok: false, error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('clinic_events')
        .select('clinic_id, event_type');

      if (error) throw error;

      // Aggregate counts
      const counts = {};
      (data || []).forEach(row => {
        if (!counts[row.clinic_id]) {
          counts[row.clinic_id] = { whatsapp: 0, call: 0, directions: 0, booking: 0 };
        }
        counts[row.clinic_id][row.event_type]++;
      });

      return json(200, { ok: true, counts });
    }

    return json(405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('track function error:', err);
    return json(500, { ok: false, error: err.message || 'Server error' });
  }
};
