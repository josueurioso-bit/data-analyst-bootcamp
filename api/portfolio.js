// Portfolio API — Returns all submissions for a session
// GET /api/portfolio?session_id=<uuid>

export default async function handler(req, res) {
  const { setCorsHeaders } = await import('./lib/cors.js');
  setCorsHeaders(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'session_id is required' });
  }

  try {
    const { getSubmissionsBySessionId } = await import('./lib/db-supabase.js');
    const submissions = await getSubmissionsBySessionId(session_id);
    return res.status(200).json({ submissions });
  } catch (error) {
    console.error('[Portfolio] Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
