const { cmd } = require('../command');

cmd({
    pattern: "ping",
    desc: "Check bot speed & status",
    react: "🏓",
    category: "fun",
    filename: __filename
}, async (conn, m, store, { reply }) => {
    const start = Date.now();

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const end = Date.now();
    const speed = end - start;

    reply(
`🏓 *PONG!*

⚡ Speed : *${speed} ms*
⏱ Uptime : *${hours}h ${minutes}m ${seconds}s*
🤖 Status : *Online & Working* ✅`
    );
});
