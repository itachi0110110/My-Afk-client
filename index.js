const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
const CONFIG_FILE = './config.json';

// ১. কনফিগ ফাইল পড়া বা তৈরি করা
let config = {
    host: '://example.com',
    port: 25565,
    username: 'MyBot',
    version: '1.20.1',
    dcToken: '',
    dcChannel: ''
};

if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE));
}

// ২. ওয়েব ড্যাশবোর্ড (সেটিং পরিবর্তনের ফরম)
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#121212; color:white; font-family:sans-serif; padding:40px;">
            <h2>⚙️ Bot Control Panel</h2>
            <form action="/save" method="POST" style="display:grid; gap:10px; width:300px;">
                Server IP: <input name="host" value="${config.host}">
                Port: <input name="port" value="${config.port}">
                Bot Name: <input name="username" value="${config.username}">
                MC Version: <input name="version" value="${config.version}">
                Discord Token: <input name="dcToken" value="${config.dcToken}" type="password">
                Channel ID: <input name="dcChannel" value="${config.dcChannel}">
                <button type="submit" style="padding:10px; background:green; color:white; border:none;">SAVE & RESTART</button>
            </form>
            <p>Status: <span style="color:lime;">Running</span></p>
        </body>
    `);
});

// ৩. সেটিংস সেভ করার রুট
app.post('/save', (req, res) => {
    config = req.body;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    res.send('✅ Settings Saved! Restarting bot...');
    process.exit(1); // বটি রিস্টার্ট হবে নতুন সেটিংস নিয়ে
});

app.listen(process.env.PORT || 8080);

// ৪. Mineflayer বটের মেইন ফাংশন
function startBot() {
    const bot = mineflayer.createBot({
        host: config.host,
        port: parseInt(config.port),
        username: config.username,
        version: config.version,
        auth: 'offline'
    });

    bot.on('login', () => console.log('✔ Bot is in the server!'));
    bot.on('end', () => setTimeout(startBot, 5000));
    bot.on('error', (err) => console.log(err));
}

startBot();
