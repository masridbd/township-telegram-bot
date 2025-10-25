module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use GET.' 
    });
  }

  res.status(200).json({ 
    success: true,
    status: 'OK', 
    service: 'Township Telegram Bot API',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    node_version: process.version,
    endpoints: {
      health: 'GET /api/health',
      telegram: 'POST /api/telegram'
    }
  });
};
