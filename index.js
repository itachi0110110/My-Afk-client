const mineflayer = require('mineflayer');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const CONFIG_FILE = './config.json';

// ১. কনফিগ লোড করা
let config = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE)) : {
    host: '://example.com',
    port: 25565,
    username: 'ConsoleBot',
    version: '1.20.1',
    dcToken: '',
    dcChannel: '',
    ownerId: ''
};

// ২. ওয়েব ড্যাশবোর্ড (A to Z UI)
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>MCC Web Client</title><style>
        body { background: #0c0c0c; color: #00ff00; font-family: 'Courier New', monospace; padding: 20px; }
        .box { border: 1px solid #333; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        input { background: #1a1a1a; border: 1px solid #00ff00; color: white; padding: 8px; margin: 5px 0; width: 100%; }
        button { background: #00ff00; color: black; border: none; padding: 10px; cursor: pointer; font-weight: bold; width: 100%; }
        .log-box { background: black; height: 200px; overflow-y: scroll; border: 1px solid #444; padding: 10px; font-size: 12px; }
    </style></head>
    <body>
        <h1>🖥️ MCC CLOUD CLIENT</h1>
        <div class="box">
            <h3>⚙️ Bot Configuration</h3>
            <form action="/save" method="POST">
                <label>Server IP:</label> <input name="host" value="${config.host}">
                <label>Port:</label> <input name="port" value="${config.port}">
                <label>Bot Name (Cracked):</label> <input name="username" value="${config.username}">
                <label>MC Version:</label> <input name="version" value="${config.version}">
                <label>Discord Bot Token:</label> <input name="dcToken" type="password" value="${config.dcToken}">
                <label>Discord Channel ID:</label> <input name="dcChannel" value="${config.dcChannel}">
                <button type="submit">SAVE & CONNECT BOT</button>
            </form>
        </div>
        <div class="box">
            <h3>📜 Live Console</h3>
            <div class="log-box" id="logs">Connecting to server...</div>
        </div>
        <script>
            setInterval(() => { location.reload(); }, 15000);
        </script>
    </body>
    </html>
    `);
});

app.post('/save', (req, res) => {
    config = req.body;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    res.send('<h1>✅ Config Saved! Restarting...</h1><script>setTimeout(()=>window.location.href="/",3000)</script>');
    process.exit(1); 
});

app.listen(process.env.PORT || 8080);

// ৩. মাইনক্রাফট ও ডিসকর্ড বট লজিক
const dcClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

function initBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: parseInt(config.port),
        username: config.username,
        version: config.version,
        auth: 'offline'
    });

    bot.on('login', () => {
        console.log(`[MC] Logged in as ${bot.username}`);
        if(config.dcToken) sendToDC('🟢 Bot Connected to ' + config.host);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        sendToDC(`**${username}**: ${message}`);
    });

    bot.on('error', (err) => console.log('Error:', err));
    bot.on('end', () => setTimeout(initBot, 10000));
}

function sendToDC(msg) {
    if (!config.dcToken || !config.dcChannel) return;
    const channel = dcClient.channels.cache.get(config.dcChannel);
    if (channel) channel.send(msg);
}

if (config.dcToken) {
    dcClient.login(config.dcToken).then(initBot).catch(() => initBot());
} else {
    initBot();
}
