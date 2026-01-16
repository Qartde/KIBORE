const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "rahmany",
  category: "Premium",
  reaction: "🛡️"
}, async (dest, zk, repondre, ms) => {
  try {
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
- *Latency:* ${Math.floor(Math.random() * 100) + 10}ms
- *Core:* Zokou/TIMNASA Framework
- *Host:* Heroku Server

*⚠️ WARNING:*
System optimized for high-speed tasks. Use with authority.

*POWERED BY RAHMANY*
    `;

    // 3. Audio Configuration (Link ya sauti yako ya MP3)
    const audioUrl = "https://files.catbox.moe/5z8u1a.mp3"; 

    // 4. Send Message with Audio, Text details, and Channel JID
    await zk.sendMessage(dest, { 
      audio: { url: audioUrl }, 
      mimetype: 'audio/mp4', 
      ptt: true, // Inatokea kama Voice Note
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363353854480831@newsletter", // Badilisha na JID yako halisi ya channel
          newsletterName: "RAHMANY SYSTEM MD",
          serverMessageId: 144
        },
        externalAdReply: {
          title: "RAHMANY SYSTEM V2.0",
          body: "Maximum Performance Authorized",
          thumbnailUrl: "https://telegra.ph/file/dc3a3286f6a73a6285226.jpg", 
          sourceUrl: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X", // Link ya channel yako
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: ms });

    // 5. Pia inatuma maelezo ya ziada ya maandishi chini yake
    await zk.sendMessage(dest, { text: rahmany_msg }, { quoted: ms });

  } catch (error) {
    console.error("Error in Rahmany Command: ", error);
    repondre("System error: Unable to process the request.");
  }
});
