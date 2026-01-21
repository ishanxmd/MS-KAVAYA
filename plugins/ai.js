const { cmd } = require('../command');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ====================== AI Chat ======================
cmd({
    pattern: "ai",
    desc: "Chat with AI",
    react: "🤖",
    category: "ai",
    filename: __filename
}, async (conn, m, store, { reply, text }) => {
    if (!text) return reply("❌ Ask something: `.ai hello`");
    try {
        const start = Date.now();
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful WhatsApp bot AI." },
                { role: "user", content: text }
            ]
        });
        const speed = Date.now() - start;
        reply(`🤖 *AI Response*\n\n📝 Q: ${text}\n💬 A: ${res.choices[0].message.content}\n⚡ Response Time: ${speed} ms`);
    } catch (e) { reply("❌ AI request failed."); console.error(e); }
});

// ====================== AI Image Generate ======================
cmd({
    pattern: "img",
    desc: "Generate AI Image",
    react: "🖼️",
    category: "ai",
    filename: __filename
}, async (conn, m, store, { reply, text }) => {
    if (!text) return reply("🖼️ Give a description: `.img sunset beach 4k`");
    try {
        const res = await openai.images.generate({ model: "gpt-image-1", prompt: text, size: "1024x1024" });
        const img = res.data[0].url;
        await conn.sendMessage(m.chat, { image: { url: img }, caption: `🖼️ AI Image\nPrompt: ${text}` }, { quoted: m });
    } catch (e) { reply("❌ Image generation failed."); console.error(e); }
});

// ====================== AI Vision / Image Analysis ======================
cmd({
    pattern: "vision",
    desc: "Analyze image",
    react: "👁️",
    category: "ai",
    filename: __filename
}, async (conn, m, store, { reply }) => {
    try {
        if (!m.quoted || !m.quoted.imageMessage) return reply("Reply to an image with `.vision`");
        const media = await m.quoted.download();
        const base64Image = media.toString('base64');

        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Describe this image in Sinhala or English." },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ]
        });

        reply(`👁️ *Image Analysis*\n${res.choices[0].message.content}`);
    } catch (e) { reply("❌ Image analysis failed."); console.error(e); }
});

// ====================== OCR / Text Extract ======================
cmd({
    pattern: "ocr",
    desc: "Extract text from image",
    react: "📄",
    category: "ai",
    filename: __filename
}, async (conn, m, store, { reply }) => {
    try {
        if (!m.quoted || !m.quoted.imageMessage) return reply("Reply to an image with `.ocr`");
        const media = await m.quoted.download();
        const base64Image = media.toString('base64');

        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract all text from this image." },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ]
        });

        reply(`📄 *OCR Result*\n${res.choices[0].message.content}`);
    } catch (e) { reply("❌ OCR failed."); console.error(e); }
});

// ====================== Summarize / Translate / Story ======================
cmd({ pattern: "summarize", desc: "Summarize text", react: "📝", category: "ai", filename: __filename },
async (conn, m, store, { reply, text }) => {
    if (!text) return reply("❌ Text to summarize: `.summarize <text>`");
    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: `Summarize this: ${text}` }]
        });
        reply(`📝 Summary:\n${res.choices[0].message.content}`);
    } catch (e) { reply("❌ Summarize failed."); console.error(e); }
});

cmd({ pattern: "translate", desc: "Translate text", react: "🌐", category: "ai", filename: __filename },
async (conn, m, store, { reply, text }) => {
    if (!text) return reply("❌ Usage: `.translate <lang> <text>`");
    try {
        const [lang, ...txt] = text.split(" ");
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: `Translate this to ${lang}: ${txt.join(" ")}` }]
        });
        reply(`🌐 Translation:\n${res.choices[0].message.content}`);
    } catch (e) { reply("❌ Translation failed."); console.error(e); }
});

cmd({ pattern: "story", desc: "Generate story", react: "📖", category: "ai", filename: __filename },
async (conn, m, store, { reply, text }) => {
    if (!text) return reply("❌ Story topic: `.story <topic>`");
    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: `Write a creative story about: ${text}` }]
        });
        reply(`📖 Story:\n${res.choices[0].message.content}`);
    } catch (e) { reply("❌ Story generation failed."); console.error(e); }
});
