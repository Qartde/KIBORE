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
        return repondre("❌ *Tafadhali weka jina la wimbo!*\n\nExample: .play Diamond Platnumz Inama");
    }

    const query = arg.join(" ");
    await repondre(`🔍 *Natafuta:* ${query}...`);

    try {
        // ============ STEP 1: SEARCH YOUTUBE ============
        const search = await yts(query);
        if (!search.videos.length) {
            return repondre("❌ *Hakuna wimbo uliopatikana!*");
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

        // ============ STEP 2: USE RELIABLE APIs (NO KEY NEEDED) ============
        let audioUrl = null;
        let downloadSuccess = false;
        let downloadErrors = [];

        // API 1: Akurath (Reliable - No Key)
        try {
            console.log("📡 Trying API 1: Akurath...");
            const api1Url = `https://api.akurath.com/download/yt?url=${encodeURIComponent(videoUrl)}&type=audio`;
            const api1Res = await axios.get(api1Url, { timeout: 15000 });
            
            if (api1Res.data && api1Res.data.url) {
                audioUrl = api1Res.data.url;
                downloadSuccess = true;
                console.log("✅ API 1 success!");
            }
        } catch (e) {
            downloadErrors.push(`API 1 failed`);
        }

        // API 2: Diioffc (Very Reliable - No Key)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 2: Diioffc...");
                const api2Url = `https://api.diioffc.web.id/api/download/yt?url=${encodeURIComponent(videoUrl)}&type=audio`;
                const api2Res = await axios.get(api2Url, { timeout: 15000 });
                
                if (api2Res.data && api2Res.data.result && api2Res.data.result.download) {
                    audioUrl = api2Res.data.result.download;
                    downloadSuccess = true;
                    console.log("✅ API 2 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 2 failed`);
            }
        }

        // API 3: Y2Mate (No Key)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 3: Y2Mate...");
                const api3Url = `https://y2mate.guru/api/convert?url=${encodeURIComponent(videoUrl)}&type=audio`;
                const api3Res = await axios.get(api3Url, { timeout: 15000 });
                
                if (api3Res.data && api3Res.data.url) {
                    audioUrl = api3Res.data.url;
                    downloadSuccess = true;
                    console.log("✅ API 3 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 3 failed`);
            }
        }

        // API 4: Akurath Alternative (No Key)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 4: Akurath Alternative...");
                const api4Url = `https://api.akurath.xyz/api/download/yt?url=${encodeURIComponent(videoUrl)}&type=audio`;
                const api4Res = await axios.get(api4Url, { timeout: 15000 });
                
                if (api4Res.data && api4Res.data.url) {
                    audioUrl = api4Res.data.url;
                    downloadSuccess = true;
                    console.log("✅ API 4 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 4 failed`);
            }
        }

        // API 5: Akuari (No Key - Last Resort)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 5: Akuari...");
                const api5Url = `https://api.akuari.my.id/downloader/ytplay?query=${encodeURIComponent(videoUrl)}`;
                const api5Res = await axios.get(api5Url, { timeout: 15000 });
                
                if (api5Res.data && api5Res.data.result && api5Res.data.result.audio) {
                    audioUrl = api5Res.data.result.audio;
                    downloadSuccess = true;
                    console.log("✅ API 5 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 5 failed`);
            }
        }

        if (!downloadSuccess || !audioUrl) {
            console.log("❌ All APIs failed:", downloadErrors);
            
            // Send YouTube link as fallback
            const fallbackMsg = `❌ *Siwezi kupakua wimbo kwa sasa*\n\n🔗 *Link:* ${videoUrl}\n\n📝 *Title:* ${videoTitle}\n\n_Try downloading manually_`;
            
            return await repondre(fallbackMsg);
        }

        // ============ STEP 3: SEND AUDIO ============
        console.log(`✅ Audio URL obtained`);

        await repondre(`📤 *Inatuma wimbo...*`);

        // Send audio directly from URL
        await zk.sendMessage(dest, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: ms });

        // Send success message
        const successMsg = `✅ *Wimbo umetumwa!*\n\n🎵 *${videoTitle}*\n⏱️ *Duration:* ${videoDuration}`;

        await repondre(successMsg);
        console.log(`✅ Play command completed for: ${videoTitle}`);

    } catch (error) {
        console.error("❌ Play command error:", error);
        await repondre(`❌ *Kuna tatizo!*\n\n${error.message}`);
    }
});
