const { cmd } = require("../command");
const { ytmp3 } = require("sadaslk-dlcore");
const yts = require("yt-search");

let songCache = {};

async function getYoutube(query) {
  const isUrl = /(youtube\.com|youtu\.be)/i.test(query);
  if (isUrl) {
    const id = query.split("v=")[1] || query.split("/").pop();
    return await yts({ videoId: id });
  }
  const search = await yts(query);
  return search.videos[0];
}

/* ================= SONG SEARCH ================= */

cmd(
  {
    pattern: "ytmp3",
    alias: ["song", "mp3"],
    desc: "Song downloader with format select",
    category: "download",
    filename: __filename,
  },
  async (bot, mek, m, { from, q, reply }) => {
    if (!q) return reply("🎵 Song name or YouTube link එකක් දාන්න");

    reply("🔎 Searching...");
    const video = await getYoutube(q);
    if (!video) return reply("❌ Song හමු නොවුණා");

    songCache[from] = video;

    const caption =
      `🎧 *AUDIO DOWNLOADER*\n\n` +
      `🎵 *Title:* ${video.title}\n` +
      `⏱ *Duration:* ${video.timestamp}\n` +
      `👁 *Views:* ${video.views.toLocaleString()}\n` +
      `📅 *Release:* ${video.ago}\n\n` +
      `⬇️ Select download format below`;

    const listMessage = {
      image: { url: video.thumbnail },
      caption,
      footer: "© ISHAN-X",
      title: "Select Format",
      buttonText: "Select Format",
      sections: [
        {
          title: "Available Formats",
          rows: [
            {
              title: "🎧 Audio File",
              description: "Download as MP3 audio",
              rowId: "song_audio",
            },
            {
              title: "📁 Document File",
              description: "Download as document",
              rowId: "song_doc",
            },
            {
              title: "🎤 Voice Note",
              description: "Download as voice note",
              rowId: "song_vn",
            },
          ],
        },
      ],
    };

    await bot.sendMessage(from, listMessage, { quoted: mek });
  }
);

/* ================= LIST RESPONSE HANDLER ================= */

cmd(
  {
    on: "list-response",
    filename: __filename,
  },
  async (bot, mek, m, { from, reply }) => {
    if (!songCache[from]) return;

    const id = m.message.listResponseMessage.singleSelectReply.selectedRowId;
    const video = songCache[from];

    reply("⬇️ Downloading...");
    const data = await ytmp3(video.url);
    if (!data?.url) return reply("❌ Download failed");

    if (id === "song_audio") {
      await bot.sendMessage(
        from,
        { audio: { url: data.url }, mimetype: "audio/mpeg" },
        { quoted: mek }
      );
    }

    if (id === "song_doc") {
      await bot.sendMessage(
        from,
        {
          document: { url: data.url },
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`,
        },
        { quoted: mek }
      );
    }

    if (id === "song_vn") {
      await bot.sendMessage(
        from,
        {
          audio: { url: data.url },
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: mek }
      );
    }

    delete songCache[from];
  }
);
