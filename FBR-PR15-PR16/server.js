const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

const vapidKeys = {
    publicKey: 'BMSg2LhL396PpRdUxfLLS0HJz4rddUySFF5PZX-P5yzQp-_SLHyKxaCwIXfcjBWYve3ZMloj-RBsSGyk2GZo5Ug',
    privateKey: '6ibZXlVNDeebtaVKnG0jN4ufdBUzTPWYly7yvaq6EYQ'
};

webpush.setVapidDetails(
    'mailto:notes@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

let subscriptions = [];

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
};

const server = https.createServer(sslOptions, app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('📡 Клиент подключен:', socket.id);
    
    socket.on('newTask', (task) => {
        console.log('📝 Новая заметка:', task.text);
        
        io.emit('taskAdded', task);
        
        const payload = JSON.stringify({
            title: '🌙 Новая заметка',
            body: task.text.substring(0, 50),
            icon: '/icons/icon-128.png',
            badge: '/icons/icon-64.png'
        });
        
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push ошибка:', err);
                if (err.statusCode === 410) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                }
            });
        });
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Клиент отключен:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    if (!subscriptions.find(s => s.endpoint === subscription.endpoint)) {
        subscriptions.push(subscription);
        console.log('✅ Подписка добавлена, всего:', subscriptions.length);
    }
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    console.log('❌ Подписка удалена, осталось:', subscriptions.length);
    res.status(200).json({ message: 'Подписка удалена' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 HTTPS Сервер: https://localhost:${PORT}`);
});