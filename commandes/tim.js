const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "rahmany",
  category: "Premium",
  reaction: "🛡️"
}, async (dest, zk, repondre, ms) => {
  
  // 1. Secret Payload using Base64
  const status = "U3lzdGVtIE9ubGluZQ=="; // "System Online"
  const power = "TWF4aW11bSBQZXJmb3JtYW5jZQ=="; // "Maximum Performance"
  const security = "RW5jcnlwdGVkIEJhc2U2NA=="; // "Encrypted Base64"

  // 2. System Stats Calculation
  const uptime = process.uptime();
  const hrs = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  
  const rahmany_msg = `
*──『 RAHMANY POWER-MD 』──*

*🆔 ID:* TIMNASA-X1
*🛡️ STATUS:* ${Buffer.from(status, 'base64').toString('utf-8')}
*⚡ PERFORMANCE:* ${Buffer.from(power, 'base64').toString('utf-8')}
*🔒 ENCRYPTION:* ${Buffer.from(security, 'base64').toString('utf-8')}

*📊 SYSTEM LOGS:*
- *Uptime:* ${hrs}h ${mins}m
- *Speed:* ${Math.floor(Math.random() * 100) + 10}ms
- *Core:* Zokou/TIMNASA Framework
- *Host:* Heroku Server

*⚠️ WARNING:*
System optimized for high-speed tasks. Use with authority.

*POWERED BY RAHMANY*
  `;

  // 3. Audio Configuration (Replace with your direct mp3 link)
  const audioUrl = "https://files.catbox.moe/5z8u1a.mp3"; 

  // 4. Sending the Message with Audio and Channel Verification
  await zk.sendMessage(dest, { 
    audio: { url: audioUrl }, 
    mimetype: 'audio/mp4', 
    ptt: true, // Sends as a blue-mic Voice Note
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363297121234567@newsletter", // Replace with your actual Channel JID
        newsletterName: "RAHMANY SYSTEM MD",
        serverMessageId: 144
      },
      externalAdReply: {
        title: "RAHMANY SYSTEM V2.0",
        body: "Maximum Performance Authorized",
        thumbnailUrl: "https://telegra.ph/file/dc3a3286f6a73a6285226.jpg", // Your image link
        sourceUrl: "https://whatsapp.com/channel/your-channel-link", // Your channel link
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: ms });

  // 5. Send the text details separately for clarity
  await zk.sendMessage(dest, { text: rahmany_msg }, { quoted: ms });
});
