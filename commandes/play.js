const { zokou } = require("../framework/zokou");
const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

// Ensure temp folder exists
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

zokou({
    nomCom: "play",
    categorie: "Music",
    reaction: "🎵",
    desc: "Download music from YouTube",
    fromMe: false
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    if (!arg || arg.length === 0) {
        return repondre("❌ *Please provide a song name!*\n\nExample: .play Diamond Platnumz Inama");
    }

    const query = arg.join(" ");
    await repondre(`🔍 *Searching:* ${query}...`);

    try {
        // ============ STEP 1: SEARCH YOUTUBE ============
        const search = await yts(query);
        if (!search.videos.length) {
            return repondre("❌ *No songs found!*");
        }

        const video = search.videos[0];
        const videoUrl = video.url;
        const videoTitle = video.title;
        const videoDuration = video.timestamp;
        const videoThumb = video.thumbnail;
        const videoChannel = video.author.name;
        const videoId = video.videoId;

        // Send song info
        const infoMsg = `╭━━━ *『 RAHMANI MUSIC 』* ━━━╮
┃
┃ 🎵 *Title:* ${videoTitle}
┃ ⏱️ *Duration:* ${videoDuration}
┃ 👤 *Channel:* ${videoChannel}
┃
┃ ⏳ *Downloading audio...*
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
_Powered by RAHMANI-XMD_`;

        await zk.sendMessage(dest, {
            image: { url: videoThumb },
            caption: infoMsg
        }, { quoted: ms });

        // ============ STEP 2: TRY ALL YOUR PROVIDED APIS ============
        let audioUrl = null;
        let downloadSuccess = false;
        let downloadErrors = [];

        // Your list of APIs (all in English)
        const apis = [
            {
                name: "DavidCyril MP4",
                url: `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
                responsePath: "url" // Expected response: { "url": "..." }
            },
            {
                name: "DavidCyril MP3",
                url: `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(videoUrl)}`,
                responsePath: "url" // Expected response: { "url": "..." }
            },
            {
                name: "DarkYasiya",
                url: `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
                responsePath: "url" // Expected response: { "url": "..." }
            },
            {
                name: "GiftedTech",
                url: `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
                responsePath: "result.download" // Expected response: { "result": { "download": "..." } }
            },
            {
                name: "Dreaded",
                url: `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`,
                responsePath: "url" // Expected response: { "url": "..." }
            },
            // Backup APIs (no key needed)
            {
                name: "Diioffc",
                url: `https://api.diioffc.web.id/api/download/yt?url=${encodeURIComponent(videoUrl)}&type=audio`,
                responsePath: "result.download" // { "result": { "download": "..." } }
            },
            {
                name: "Akurath",
                url: `https://api.akurath.com/download/yt?url=${encodeURIComponent(videoUrl)}&type=audio`,
                responsePath: "url" // { "url": "..." }
            },
            {
                name: "Akuari",
                url: `https://api.akuari.my.id/downloader/ytplay?query=${encodeURIComponent(videoUrl)}`,
                responsePath: "result.audio" // { "result": { "audio": "..." } }
            }
        ];

        // Try each API one by one
        for (const api of apis) {
            try {
                console.log(`📡 Trying API: ${api.name}...`);
                const response = await axios.get(api.url, { 
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.data) {
                    // Handle different response structures
                    if (api.responsePath === "url" && response.data.url) {
                        audioUrl = response.data.url;
                        downloadSuccess = true;
                        console.log(`✅ ${api.name} success!`);
                        break;
                    }
                    else if (api.responsePath === "result.download" && response.data.result?.download) {
                        audioUrl = response.data.result.download;
                        downloadSuccess = true;
                        console.log(`✅ ${api.name} success!`);
                        break;
                    }
                    else if (api.responsePath === "result.audio" && response.data.result?.audio) {
                        audioUrl = response.data.result.audio;
                        downloadSuccess = true;
                        console.log(`✅ ${api.name} success!`);
                        break;
                    }
                    // Check for alternative response formats
                    else if (response.data.link) {
                        audioUrl = response.data.link;
                        downloadSuccess = true;
                        console.log(`✅ ${api.name} success (using link)!`);
                        break;
                    }
                    else if (response.data.download) {
                        audioUrl = response.data.download;
                        downloadSuccess = true;
                        console.log(`✅ ${api.name} success (using download)!`);
                        break;
                    }
                    else if (response.data.audio) {
                        audioUrl = response.data.audio;
                        downloadSuccess = true;
                        console.log(`✅ ${api.name} success (using audio)!`);
                        break;
                    }
                }
            } catch (error) {
                downloadErrors.push(`${api.name}: ${error.message}`);
                console.log(`❌ ${api.name} failed: ${error.message}`);
                continue; // Try next API
            }
        }

        if (!downloadSuccess || !audioUrl) {
            console.log("❌ All APIs failed:", downloadErrors);
            
            // Send YouTube link as fallback
            const fallbackMsg = `❌ *Could not download the song*\n\n🔗 *YouTube Link:* ${videoUrl}\n\n📝 *Title:* ${videoTitle}\n\n_Please try downloading manually_`;
            
            return await repondre(fallbackMsg);
        }

        // ============ STEP 3: SEND AUDIO ============
        console.log(`✅ Download successful: ${audioUrl.substring(0, 100)}...`);

        await repondre(`📤 *Sending audio...*`);

        // Send audio directly from URL
        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: ms });

        // Send success message
        const successMsg = `✅ *Song sent successfully!*\n\n🎵 *${videoTitle}*\n⏱️ *Duration:* ${videoDuration}`;

        await repondre(successMsg);
        console.log(`✅ Play command completed for: ${videoTitle}`);

    } catch (error) {
        console.error("❌ Play command error:", error);
        await repondre(`❌ *Error:* ${error.message}`);
    }
});
