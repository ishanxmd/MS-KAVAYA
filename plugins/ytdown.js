const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

const pendingSearch = {};
const pendingType = {};

// ================= SEARCH COMMAND =================
cmd({
    pattern: "play",
    desc: "Search song or video",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, {
    from, args, sender
}) => {
    if (!args[0]) {
        return conn.sendMessage(from, { text: "❌ Song / Video name එකක් දෙන්න" }, { quoted: mek });
    }

    const query = args.join(" ");
    const res = await yts(query);

    if (!res.videos.length) {
        return conn.sendMessage(from, { text: "❌ Result not found" }, { quoted: mek });
    }

    const results = res.videos.slice(0, 10);
    pendingSearch[sender] = results;

    let list = `🎶 *Search Results*\n\n`;
    results.forEach((v, i) => {
        list += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n\n`;
    });

    list += `🔢 Reply with number (1-${results.length})`;

    await conn.sendMessage(from, { text: list }, { quoted: mek });
});

// ================= REPLY HANDLER =================
cmd({
    on: "text"
}, async (conn, mek, m, {
    from, body, sender
}) => {

    // ====== STEP 1: SELECT SONG ======
    if (pendingSearch[sender]) {
        const index = parseInt(body.trim()) - 1;
        const data = pendingSearch[sender][index];

        if (!data) {
            return conn.sendMessage(from, { text: "❌ Invalid number" }, { quoted: mek });
        }

        delete pendingSearch[sender];
        pendingType[sender] = data;

        return conn.sendMessage(from, {
            text: `🎧 *Choose Download Type*\n\n1️⃣ Audio\n2️⃣ Video\n\nReply 1 or 2`
        }, { quoted: mek });
    }

    // ====== STEP 2: SELECT TYPE ======
    if (pendingType[sender]) {
        const choice = body.trim();
        const info = pendingType[sender];
        delete pendingType[sender];

        if (choice === "1") {
            // AUDIO
            const audio = ytdl(info.url, {
                filter: "audioonly",
                quality: "highestaudio"
            });

            return conn.sendMessage(from, {
                audio: audio,
                mimetype: "audio/mp4",
                fileName: `${info.title}.mp3`
            }, { quoted: mek });

        } else if (choice === "2") {
            // VIDEO
            const video = ytdl(info.url, {
                filter: "audioandvideo",
                quality: "highest"
            });

            return conn.sendMessage(from, {
                video: video,
                mimetype: "video/mp4",
                fileName: `${info.title}.mp4`
            }, { quoted: mek });

        } else {
            return conn.sendMessage(from, { text: "❌ Invalid option" }, { quoted: mek });
        }
    }
});
 
