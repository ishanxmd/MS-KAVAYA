const {  
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { sms, downloadMediaMessage } = require('./lib/msg');
const {
  getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94761638379'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

async function ensureSessionFile() {
  if (!fs.existsSync(credsPath)) {
    if (!config.SESSION_ID) {
      console.error('❌ SESSION_ID env variable is missing. Cannot restore session.');
      process.exit(1);
    }

    console.log("🔄 creds.json not found. Downloading session from MEGA...");

    const filer = File.fromURL(`https://mega.nz/file/${config.SESSION_ID}`);

    filer.download((err, data) => {
      if (err) {
        console.error("❌ Failed to download session file:", err);
        process.exit(1);
      }

      fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
      fs.writeFileSync(credsPath, data);
      console.log("✅ Session downloaded. Restarting bot...");
      setTimeout(connectToWA, 2000);
    });
  } else {
    setTimeout(connectToWA, 1000);
  }
}

const antiDeletePlugin = require('./plugins/antidelete.js');
global.pluginHooks = global.pluginHooks || [];
global.pluginHooks.push(antiDeletePlugin);

async function connectToWA() {
  console.log("Connecting 👑 ISHAN BOT");
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, '/auth_info_baileys/')
  );
  const { version } = await fetchLatestBaileysVersion();

  const ishan = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  ishan.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('✅ ISHAN BOT CONNECTED');

      await ishan.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: {
          url: "https://files.catbox.moe/d0z6ym.JPG"
        },
        caption: "👑 ISHAN BOT ONLINE ✅"
      });

      fs.readdirSync("./plugins/")
        .filter(p => p.endsWith(".js"))
        .forEach(p => require(`./plugins/${p}`));
    }
  });

  ishan.ev.on('creds.update', saveCreds);

  ishan.ev.on('messages.upsert', async ({ messages }) => {
    const mek = messages[0];
    if (!mek?.message) return;

    mek.message =
      getContentType(mek.message) === 'ephemeralMessage'
        ? mek.message.ephemeralMessage.message
        : mek.message;

    const m = sms(ishan, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const body =
      mek.message.conversation ||
      mek.message[type]?.text ||
      mek.message[type]?.caption ||
      '';

    const isCmd = body.startsWith(prefix);
    const commandName = isCmd
      ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
      : '';

    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    const sender = mek.key.fromMe
      ? ishan.user.id
      : (mek.key.participant || mek.key.remoteJid);

    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');
    const botNumber = ishan.user.id.split(':')[0];
    const botNumber2 = await jidNormalizedUser(ishan.user.id);

    const reply = (text) =>
      ishan.sendMessage(from, { text }, { quoted: mek });

    if (isCmd) {
      const cmd = commands.find(
        c => c.pattern === commandName || c.alias?.includes(commandName)
      );
      if (cmd) {
        if (cmd.react) {
          await ishan.sendMessage(from, {
            react: { text: cmd.react, key: mek.key }
          });
        }
        cmd.function(ishan, mek, m, {
          from, quoted: mek, body, isCmd,
          command: commandName, args, q,
          isGroup, sender, senderNumber,
          botNumber, botNumber2, reply
        });
      }
    }
  });

  ishan.ev.on('messages.update', async (updates) => {
    for (const plugin of global.pluginHooks) {
      if (plugin.onDelete) {
        await plugin.onDelete(ishan, updates);
      }
    }
  });
}

ensureSessionFile();

app.get("/", (req, res) => {
  res.send("👑 ISHAN BOT STARTED ✅");
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
