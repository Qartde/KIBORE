const { zokou } = require("../framework/zokou");
const conf = require("../set");
const axios = require("axios");
const yts = require("yt-search");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");
const path = require("path");

// ═══════════════════════════════════════════════
//   ⚡ RAHMANI-XMD : MEDIA ENGINE
// ═══════════════════════════════════════════════

const botUI = {
    channelJid: "120363353854480831@newsletter",
    channelLink: "https://whatsapp.com/channel/0029VatokI45EjxufALmY32X",
    thumbnail: "https://files.catbox.moe/aktbgo.jpg",
    botName: () => conf.BOT_NAME || "RAHMANI-XMD"
};

// Function ya ku-convert audio kuwa MP3 halisi
async function convertToMp3(inputBuffer) {
    const tempInput = path.join(__dirname, `temp_${Date.now()}.tmp`);
    const tempOutput = path.join(__dirname, `temp_${Date.now()}.mp3`);
    fs.writeFileSync(tempInput, inputBuffer);

    return new Promise((resolve, reject) => {
        ffmpeg(tempInput)
            .audioCodec("libmp3lame")
            .format("mp3")
            .audioBitrate("128k")
            .audioChannels(2)
            .audioFrequency(44100)
            .on("end", () => {
                const output = fs.readFileSync(tempOutput);
                fs.unlinkSync(tempInput);
                fs.unlinkSync(tempOutput);
                resolve(output);
            })
            .on("error", (err) => {
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                reject(err);
            })
            .save(tempOutput);
    });
}

async function fetchMedia(query, type) {
    const ytSearch = await yts(query);
    if (!ytSearch.videos || ytSearch.videos.length === 0) {
        throw new Error("No results found on YouTube.");
    }
    
    const bestMatch = ytSearch.videos[0];
    const ytUrl = bestMatch.url;

    let apiEndpoint = type === "audio" 
        ? "https://apiziaul.vercel.app/api/downloader/ytplaymp3"
        : "https://apiziaul.vercel.app/api/downloader/ytmp4";
        
    let params = type === "audio" ? { query: query } : { url: ytUrl };

    const response = await axios.get(apiEndpoint, { params, timeout: 45000 });
    const json = response.data;

    if (!json.status || !json.result || !json.result.downloadUrl) {
        throw new Error("API failed to return a valid download link.");
    }

    return {
        downloadUrl: json.result.downloadUrl,
        title: json.result.title || bestMatch.title,
        duration: bestMatch.timestamp,
        thumbnail: bestMatch.thumbnail,
        ytUrl: ytUrl
    };
}

function generateCaption(media, type) {
    const isAudio = type === "audio";
    return `${isAudio ? "🎵" : "🎥"} *${botUI.botName()} ${isAudio ? "AUDIO" : "VIDEO"}*

┌─────────────────────
│  📛 *Title:* ${media.title.substring(0, 45)}
│  ⏱️ *Duration:* ${media.duration}
│  📦 *Format:* ${isAudio ? "MP3" : "MP4"}
│
└─────────────────────

⚡ *Powered by ${botUI.botName()}*

> *View channel*`;
}

function buildUsageMessage(type) {
    const isAudio = type === "audio";
    return `${isAudio ? "🎵" : "🎥"} *${botUI.botName()} ${isAudio ? "PLAY" : "VIDEO"}*

┌─────────────────────
│  📖 *Usage:*
│  ▸ .${isAudio ? "play" : "video"} <${isAudio ? "song name" : "video name"}>
│  ▸ .${isAudio ? "play" : "video"} <youtube link>
│
│  💡 *Example:*
│  ▸ .${isAudio ? "play" : "video"} ${isAudio ? "Faded Alan Walker" : "Despacito"}
│
└─────────────────────

> *View channel*`;
}

function buildErrorBox(errorMsg) {
    return `❌ *FAILED*

┌─────────────────────
│  ⚠️ *Error:*
│  ${errorMsg.substring(0, 150)}
│
└─────────────────────

> *View channel*`;
}

function getContextInfo(media) {
    return {
        forwardingScore: 999, 
        isForwarded: true,
        forwardedNewsletterMessageInfo: { 
            newsletterJid: botUI.channelJid, 
            newsletterName: botUI.botName(), 
            serverMessageId: 143 
        },
        externalAdReply: { 
            title: `🎵 ${media.title.substring(0, 40)}`, 
            body: `Downloaded via ${botUI.botName()}`, 
            mediaType: 1, 
            mediaUrl: media.ytUrl, 
            sourceUrl: media.ytUrl, 
            thumbnailUrl: media.thumbnail || botUI.thumbnail, 
            showAdAttribution: false, 
            renderLargerThumbnail: true 
        }
    };
}

// ═══════════════════════════════════════════════
//   🎵 COMMAND: .play
// ═══════════════════════════════════════════════
zokou({
    nomCom: "play",
    categorie: "Download",
    reaction: "🎵",
    desc: "Download audio from YouTube",
    fromMe: false
}, async (dest, client, cmd) => {
    const { arg, ms, repondre, auteurMessage } = cmd;
    const query = (arg || []).join(" ").trim();

    if (!query) {
        return client.sendMessage(dest, {
            text: buildUsageMessage("audio"),
            mentions: [auteurMessage],
            contextInfo: {
                forwardingScore: 999, 
                isForwarded: true,
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: botUI.channelJid, 
                    newsletterName: botUI.botName(), 
                    serverMessageId: 143 
                },
                externalAdReply: { 
                    title: `🎵 ${botUI.botName()} PLAY`, 
                    body: "Download any song 🎧", 
                    mediaType: 1, 
                    mediaUrl: botUI.channelLink, 
                    sourceUrl: botUI.channelLink, 
                    thumbnailUrl: botUI.thumbnail, 
                    showAdAttribution: false, 
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: ms });
    }

    await repondre("⏳ *Searching for your song...*");

    try {
        const media = await fetchMedia(query, "audio");
        
        // Download audio kwanza
        const audioRes = await axios.get(media.downloadUrl, { responseType: "arraybuffer", timeout: 60000 });
        const audioBuffer = Buffer.from(audioRes.data);

        // Convert kuwa MP3 halisi (Hii inatatua tatizo la "Can't load audio")
        const mp3Buffer = await convertToMp3(audioBuffer);

        await client.sendMessage(dest, {
            audio: mp3Buffer,
            mimetype: "audio/mpeg",
            fileName: `${media.title.replace(/[^\w\s.-]/g, "").substring(0, 45)}.mp3`,
            ptt: false,
            mentions: [auteurMessage],
            contextInfo: getContextInfo(media)
        }, { quoted: ms });

    } catch (err) {
        console.error("❌ Play Error:", err.message);
        await repondre(buildErrorBox(err.message));
    }
});

// ═══════════════════════════════════════════════
//   🎥 COMMAND: .video
// ═══════════════════════════════════════════════
zokou({
    nomCom: "video",
    categorie: "Download",
    reaction: "🎥",
    desc: "Download video from YouTube",
    fromMe: false
}, async (dest, client, cmd) => {
    const { arg, ms, repondre, auteurMessage } = cmd;
    const query = (arg || []).join(" ").trim();

    if (!query) {
        return client.sendMessage(dest, {
            text: buildUsageMessage("video"),
            mentions: [auteurMessage],
            contextInfo: {
                forwardingScore: 999, 
                isForwarded: true,
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: botUI.channelJid, 
                    newsletterName: botUI.botName(), 
                    serverMessageId: 143 
                },
                externalAdReply: { 
                    title: `🎥 ${botUI.botName()} VIDEO`, 
                    body: "Download any video 🎬", 
                    mediaType: 1, 
                    mediaUrl: botUI.channelLink, 
                    sourceUrl: botUI.channelLink, 
                    thumbnailUrl: botUI.thumbnail, 
                    showAdAttribution: false, 
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: ms });
    }

    await repondre("⏳ *Searching for your video...*");

    try {
        const media = await fetchMedia(query, "video");
        const caption = generateCaption(media, "video");

        await client.sendMessage(dest, {
            video: { url: media.downloadUrl },
            mimetype: "video/mp4",
            fileName: `${media.title.replace(/[^\w\s.-]/g, "").substring(0, 45)}.mp4`,
            caption: caption,
            mentions: [auteurMessage],
            contextInfo: getContextInfo(media)
        }, { quoted: ms });

    } catch (err) {
        console.error("❌ Video Error:", err.message);
        await repondre(buildErrorBox(err.message));
    }
});
