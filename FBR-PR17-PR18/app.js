const contentDiv = document.getElementById('app-content');
const enableBtn = document.getElementById('enable-push');
const disableBtn = document.getElementById('disable-push');
const offlineBadge = document.getElementById('offline-badge');
const navTabs = document.querySelectorAll('.nav-tab');

// WebSocket подключение
const socket = io('https://localhost:3001');

// Получение уведомлений
socket.on('taskAdded', (task) => {
    showToast(`✨ Добавлена заметка: ${task.text.substring(0, 40)}`);
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// VAPID ключ
const VAPID_PUBLIC_KEY = 'BMSg2LhL396PpRdUxfLLS0HJz4rddUySFF5PZX-P5yzQp-_SLHyKxaCwIXfcjBWYve3ZMloj-RBsSGyk2GZo5Ug';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Push подписка
async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push не поддерживается');
        return;
    }
    
    if (Notification.permission === 'denied') {
        alert('Уведомления запрещены в настройках браузера');
        return;
    }
    
    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Необходимо разрешить уведомления');
            return;
        }
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        
        await fetch('https://localhost:3001/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });
        
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
        showToast('✅ Уведомления включены');
    } catch (err) {
        console.error(err);
        alert('Ошибка подписки: ' + err.message);
    }
}

async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await fetch('https://localhost:3001/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint })
            });
            await subscription.unsubscribe();
        }
        
        disableBtn.style.display = 'none';
        enableBtn.style.display = 'inline-block';
        showToast('🔕 Уведомления отключены');
    } catch (err) {
        console.error(err);
    }
}

async function checkPushStatus() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            enableBtn.style.display = 'none';
            disableBtn.style.display = 'inline-block';
        }
    }
}

if (enableBtn) enableBtn.addEventListener('click', subscribeToPush);
if (disableBtn) disableBtn.addEventListener('click', unsubscribeFromPush);

// Онлайн/офлайн статус
window.addEventListener('online', () => {
    offlineBadge.style.display = 'none';
    showToast('🌐 Интернет восстановлен');
});

window.addEventListener('offline', () => {
    offlineBadge.style.display = 'block';
});

if (!navigator.onLine) offlineBadge.style.display = 'block';

// Навигация
async function loadPage(page) {
    contentDiv.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
    
    try {
        const response = await fetch(`/content/${page}.html`);
        const html = await response.text();
        contentDiv.innerHTML = html;
        
        if (page === 'home') {
            initNotesWithReminders();
        }
    } catch (err) {
        contentDiv.innerHTML = '<div class="empty-notes">⚠️ Ошибка загрузки</div>';
        console.error(err);
    }
}

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadPage(tab.dataset.page);
    });
});

// Генерация уникального ID
function generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Модуль заметок с напоминаниями
function initNotesWithReminders() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');
    const list = document.getElementById('notes-list');
    
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('kupala-notes') || '[]');
        
        if (notes.length === 0) {
            list.innerHTML = '<div class="empty-notes">🌙 Нет заметок. Напишите первую...</div>';
            return;
        }
        
        list.innerHTML = notes.map((note, index) => {
            let reminderHtml = '';
            if (note.reminder) {
                const reminderDate = new Date(note.reminder);
                const isExpired = reminderDate < Date.now();
                reminderHtml = `<div class="reminder-badge">⏰ Напоминание: ${reminderDate.toLocaleString()} ${isExpired ? '(просрочено)' : ''}</div>`;
            }
            
            return `
                <div class="note-item ${note.reminder ? 'has-reminder' : ''}">
                    <button class="delete-note" data-index="${index}">✖</button>
                    <div class="note-text">📝 ${escapeHtml(note.text)}</div>
                    <div class="note-date">${note.datetime || 'Нет даты'}</div>
                    ${reminderHtml}
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', () => {
                const notes = JSON.parse(localStorage.getItem('kupala-notes') || '[]');
                const deletedNote = notes[parseInt(btn.dataset.index)];
                
                // Если у заметки есть напоминание, отменяем его на сервере
                if (deletedNote && deletedNote.reminderId) {
                    socket.emit('cancelReminder', { reminderId: deletedNote.reminderId });
                }
                
                notes.splice(parseInt(btn.dataset.index), 1);
                localStorage.setItem('kupala-notes', JSON.stringify(notes));
                loadNotes();
            });
        });
    }
    
    // Обычная заметка
    function addNote(text) {
        if (!text.trim()) return;
        
        const notes = JSON.parse(localStorage.getItem('kupala-notes') || '[]');
        const newNote = {
            id: generateId(),
            text: text.trim(),
            datetime: new Date().toLocaleString('ru-RU')
        };
        
        notes.unshift(newNote);
        localStorage.setItem('kupala-notes', JSON.stringify(notes));
        loadNotes();
        input.value = '';
        
        socket.emit('newTask', newNote);
        showToast('✅ Заметка сохранена');
    }
    
    // Заметка с напоминанием
    function addReminder(text, reminderTimestamp) {
        if (!text.trim()) return;
        if (!reminderTimestamp) return;
        
        const reminderTimeMs = new Date(reminderTimestamp).getTime();
        const now = Date.now();
        
        if (reminderTimeMs <= now) {
            showToast('❌ Время напоминания должно быть в будущем');
            return;
        }
        
        const notes = JSON.parse(localStorage.getItem('kupala-notes') || '[]');
        const reminderId = generateId();
        const newNote = {
            id: generateId(),
            reminderId: reminderId,
            text: text.trim(),
            reminder: reminderTimeMs,
            datetime: new Date().toLocaleString('ru-RU')
        };
        
        notes.unshift(newNote);
        localStorage.setItem('kupala-notes', JSON.stringify(notes));
        loadNotes();
        
        // Отправляем напоминание на сервер
        socket.emit('newReminder', {
            id: reminderId,
            text: text.trim(),
            reminderTime: reminderTimeMs
        });
        
        reminderText.value = '';
        reminderTime.value = '';
        showToast('✅ Напоминание установлено на ' + new Date(reminderTimeMs).toLocaleString());
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            addNote(input.value);
        });
    }
    
    if (reminderForm) {
        reminderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addReminder(reminderText.value, reminderTime.value);
        });
    }
    
    loadNotes();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ SW зарегистрирован');
            checkPushStatus();
        } catch (err) {
            console.error('❌ SW ошибка:', err);
        }
    });
}

loadPage('home');