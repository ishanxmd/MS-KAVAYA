const { cmd } = require('../command');
const os = require('os');

cmd({
    pattern: "ping",
    desc: "Check bot speed, status & memory",
    react: "🏓",
    category: "fun",
    filename: __filename
}, async (conn, m, store, { reply }) => {
    const start = Date.now();

    // Uptime
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Speed
    const speed = Date.now() - start;

    // RAM usage (Memory)
    const usedRam = process.memoryUsage().rss / 1024 / 1024;
    const totalRam = os.totalmem() / 1024 / 1024;

    // Bot name
    const botName = "ISHAN-X MD";

    reply(
`🏓 *PONG!*

🚀 Bot : *${botName}*
⚡ Speed : *${speed.toFixed(2)} ms*
⏱ Uptime : *${hours}h ${minutes}m ${seconds}s*
🧠 RAM : *${usedRam.toFixed(2)} MB / ${totalRam.toFixed(0)} MB*
🤖 Status : *Online & Working* ✅`
    );
});
