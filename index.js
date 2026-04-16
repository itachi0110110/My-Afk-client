const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// --- ১. ওয়েব ড্যাশবোর্ড সেটআপ ---
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body style="background:#111; color:#0f0; font-family:monospace; padding:20px;">
                <h1>🎮 Bot Dashboard</h1>
                <div id="logs" style="border:1px solid #333; padding:10px; height:300px; overflow-y:scroll;">
                    <p>> Bot is online and monitoring...</p>
                </div>
                <script>
                    setTimeout(() => { location.reload(); }, 30000); // অটো রিফ্রেশ
                </script>
            </body>
        </html>
    `);
});
app.listen(port, () => console.log(`Dashboard running on port ${port}`));

// --- ২. ডিসকর্ড বট সেটআপ ---
const dcBot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const DISCORD_TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const CHANNEL_ID = 'YOUR_CHANNEL_ID';

dcBot.login(DISCORD_TOKEN);

// --- ৩. মাইনক্রাফট বট সেটআপ ---
const bot = mineflayer.createBot({
    host: 'SERVER_IP', 
    port: 25565,
    username: 'ConsoleBot',
    version: '1.20.1'
});

// ডিসকর্ডে লগ পাঠানো
function sendToDiscord(user, message) {
    const channel = dcBot.channels.cache.get(CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`**${user}**: ${message}`);
        channel.send({ embeds: [embed] });
    }
}

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    sendToDiscord(username, message); // গেম চ্যাট ডিসকর্ডে পাঠাবে
});

// ডিসকর্ড থেকে গেমে মেসেজ পাঠানো
dcBot.on('messageCreate', (message) => {
    if (message.author.bot || message.channel.id !== CHANNEL_ID) return;
    bot.chat(`[Discord] ${message.author.username}: ${message.content}`);
});

bot.on('login', () => console.log('✅ MC Bot Connected!'));
bot.on('error', (err) => console.log('⚠️ Error:', err));
