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

// Хранилище активных напоминаний
const reminders = new Map();

// Поиск файлов сертификатов
const possibleKeyFiles = ['localhost-key.pem', 'localhost+2-key.pem', 'key.pem'];
const possibleCertFiles = ['localhost.pem', 'localhost+2.pem', 'cert.pem'];

let keyFile = null;
let certFile = null;

for (const f of possibleKeyFiles) {
    if (fs.existsSync(path.join(__dirname, f))) {
        keyFile = f;
        break;
    }
}

for (const f of possibleCertFiles) {
    if (fs.existsSync(path.join(__dirname, f))) {
        certFile = f;
        break;
    }
}

let server;

if (keyFile && certFile) {
    const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, keyFile)),
        cert: fs.readFileSync(path.join(__dirname, certFile))
    };
    server = https.createServer(sslOptions, app);
    console.log('🔒 HTTPS режим');
} else {
    const http = require('http');
    server = http.createServer(app);
    console.log('⚠️ HTTP режим (сертификаты не найдены)');
}

const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('📡 Клиент подключен:', socket.id);
    
    // Обычная заметка
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
                if (err.statusCode === 410) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                }
            });
        });
    });
    
    // Напоминание
    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        
        console.log(`⏰ Новое напоминание: "${text}" через ${Math.round(delay / 1000)} сек`);
        
        if (delay <= 0) {
            console.log('❌ Время напоминания уже прошло');
            return;
        }
        
        const timeoutId = setTimeout(() => {
            console.log(`🔔 ОТПРАВКА НАПОМИНАНИЯ: ${text}`);
            
            const payload = JSON.stringify({
                title: '⏰ Напоминание',
                body: text,
                icon: '/icons/icon-128.png',
                badge: '/icons/icon-64.png',
                reminderId: id
            });
            
            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => {
                    console.error('Push ошибка:', err.message);
                });
            });
            
            reminders.delete(id);
        }, delay);
        
        reminders.set(id, {
            timeoutId,
            text,
            reminderTime,
            socketId: socket.id
        });
        
        console.log(`📅 Всего активных напоминаний: ${reminders.size}`);
    });
    
    // Отмена напоминания
    socket.on('cancelReminder', ({ reminderId }) => {
        if (reminders.has(reminderId)) {
            clearTimeout(reminders.get(reminderId).timeoutId);
            reminders.delete(reminderId);
            console.log(`❌ Напоминание отменено: ${reminderId}`);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Клиент отключен:', socket.id);
    });
});

// Эндпоинт для откладывания напоминания (snooze)
app.post('/snooze', (req, res) => {
    const { reminderId } = req.body;
    
    console.log(`⏰ Запрос на откладывание: ${reminderId}`);
    
    if (!reminderId || !reminders.has(reminderId)) {
        return res.status(400).json({ error: 'Напоминание не найдено' });
    }
    
    const reminder = reminders.get(reminderId);
    
    // Отменяем старый таймер
    clearTimeout(reminder.timeoutId);
    
    // Откладываем на 5 минут (300000 мс)
    const snoozeDelay = 5 * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
        console.log(`🔔 ОТПРАВКА ОТЛОЖЕННОГО НАПОМИНАНИЯ: ${reminder.text}`);
        
        const payload = JSON.stringify({
            title: '⏰ Напоминание (отложено)',
            body: reminder.text,
            icon: '/icons/icon-128.png',
            badge: '/icons/icon-64.png',
            reminderId: reminderId
        });
        
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push ошибка:', err.message);
            });
        });
        
        reminders.delete(reminderId);
    }, snoozeDelay);
    
    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: Date.now() + snoozeDelay,
        socketId: reminder.socketId
    });
    
    console.log(`⏰ Напоминание отложено на 5 минут. Новое время: ${new Date(Date.now() + snoozeDelay).toLocaleString()}`);
    
    res.status(200).json({ message: 'Напоминание отложено на 5 минут' });
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
    console.log(`\n🚀 Сервер: ${keyFile && certFile ? 'https' : 'http'}://localhost:${PORT}`);
    console.log(`📅 Система напоминаний активна`);
    console.log(`💡 Для откладывания нажмите кнопку "Отложить" в уведомлении\n`);
});