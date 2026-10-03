// netlify/functions/admin-login.js
function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '60602356Dc';

  try {
    const { passcode } = JSON.parse(event.body || '{}');
    if (!passcode) return json(400, { ok: false, error: 'Missing passcode' });

    if (passcode === ADMIN_PASSCODE) return json(200, { ok: true });
    return json(401, { ok: false, error: 'Incorrect passcode' });
  } catch (err) {
    return json(500, { ok: false, error: err.message });
  }
};
