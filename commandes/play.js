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

        // ============ STEP 2: TRY MULTIPLE DOWNLOAD APIS ============
        let audioUrl = null;
        let downloadSuccess = false;
        let downloadErrors = [];

        // API 1: y2mate (via API)
        try {
            console.log("📡 Trying API 1: y2mate...");
            const api1Url = `https://y2mate.guru/api/convert?url=${encodeURIComponent(videoUrl)}&type=audio`;
            const api1Res = await axios.get(api1Url, { timeout: 15000 });
            
            if (api1Res.data && api1Res.data.url) {
                audioUrl = api1Res.data.url;
                downloadSuccess = true;
                console.log("✅ API 1 success!");
            }
        } catch (e) {
            downloadErrors.push(`API 1 failed: ${e.message}`);
        }

        // API 2: ytmp3 (rapidapi)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 2: rapidapi...");
                const api2Url = `https://youtube-mp3-downloader2.p.rapidapi.com/ytmp3/ytmp3/`;
                const api2Res = await axios.get(api2Url, {
                    params: { url: videoUrl },
                    headers: {
                        'X-RapidAPI-Key': 'f5a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
                        'X-RapidAPI-Host': 'youtube-mp3-downloader2.p.rapidapi.com'
                    },
                    timeout: 15000
                });
                
                if (api2Res.data && api2Res.data.link) {
                    audioUrl = api2Res.data.link;
                    downloadSuccess = true;
                    console.log("✅ API 2 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 2 failed: ${e.message}`);
            }
        }

        // API 3: savemp3 (free)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 3: savemp3...");
                const api3Url = `https://savemp3.co/api/convert?url=${encodeURIComponent(videoUrl)}&format=mp3`;
                const api3Res = await axios.get(api3Url, { timeout: 15000 });
                
                if (api3Res.data && api3Res.data.link) {
                    audioUrl = api3Res.data.link;
                    downloadSuccess = true;
                    console.log("✅ API 3 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 3 failed: ${e.message}`);
            }
        }

        // API 4: converter (backup)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 4: converter...");
                const videoId = video.videoId;
                const api4Url = `https://www.yt-download.org/api/button/mp3/${videoId}`;
                const api4Res = await axios.get(api4Url, { timeout: 15000 });
                
                if (api4Res.data && api4Res.data.url) {
                    audioUrl = api4Res.data.url;
                    downloadSuccess = true;
                    console.log("✅ API 4 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 4 failed: ${e.message}`);
            }
        }

        // API 5: direct download (last resort)
        if (!downloadSuccess) {
            try {
                console.log("📡 Trying API 5: direct...");
                const api5Url = `https://api.akuari.my.id/downloader/ytplay?query=${encodeURIComponent(videoUrl)}`;
                const api5Res = await axios.get(api5Url, { timeout: 15000 });
                
                if (api5Res.data && api5Res.data.result && api5Res.data.result.audio) {
                    audioUrl = api5Res.data.result.audio;
                    downloadSuccess = true;
                    console.log("✅ API 5 success!");
                }
            } catch (e) {
                downloadErrors.push(`API 5 failed: ${e.message}`);
            }
        }

        if (!downloadSuccess || !audioUrl) {
            console.log("❌ All APIs failed:", downloadErrors);
            
            // Send YouTube link as fallback
            const fallbackMsg = `❌ *Siwezi kupakua wimbo kwa sasa*\n\n🔗 *Link:* ${videoUrl}\n\n📝 *Title:* ${videoTitle}\n\n_Try downloading manually_`;
            
            return await repondre(fallbackMsg);
        }

        // ============ STEP 3: SEND AUDIO ============
        console.log(`✅ Audio URL obtained: ${audioUrl.substring(0, 100)}...`);

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
