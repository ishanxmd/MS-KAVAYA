case 'ping': {
    const ownerNumber = ['94785457011']; // 👈 ඔයාගේ number (country code එක්ක)
    const botName = 'ISHAN-X MD';
    const botVersion = 'v1.0.0';

    // Owner only check
    if (!ownerNumber.includes(sender.split('@')[0])) {
        return sock.sendMessage(from, {
            text: '❌ This command is Owner Only!'
        });
    }

    // React emoji
    await sock.sendMessage(from, {
        react: {
            text: '🏓',
            key: mek.key
        }
    });

    // Speed
    const speed = Date.now() - mek.messageTimestamp * 1000;

    // Uptime
    const uptimeSec = process.uptime();
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = Math.floor(uptimeSec % 60);

    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    // Message
    const pingMsg = `
🏓 *PONG!*

⚡ *Speed:* ${speed} ms
🤖 *Bot:* ${botName}
📦 *Version:* ${botVersion}
⏱ *Uptime:* ${uptime}

✅ *Status:* Online & Stable
`;

    await sock.sendMessage(from, { text: pingMsg });
}
break;
