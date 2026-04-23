import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closePool } from './config/database';
import userRoutes from './routes/userRoutes';
import { IApiResponse } from './types';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000');

app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use('/api', userRoutes);

app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'User Management API',
        version: '1.0.0',
        description: 'REST API для управления пользователями с PostgreSQL на TypeScript',
        endpoints: {
            'POST /api/users': 'Создание нового пользователя',
            'GET /api/users': 'Получение списка всех пользователей',
            'GET /api/users/:id': 'Получение пользователя по ID',
            'PATCH /api/users/:id': 'Обновление информации пользователя',
            'DELETE /api/users/:id': 'Удаление пользователя',
            'GET /api/users/search?first_name=': 'Поиск пользователей по имени',
            'GET /api/users/stats/summary': 'Получение статистики по пользователям'
        },
        environment: process.env.NODE_ENV || 'development',
        database: 'PostgreSQL'
    });
});

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use((req: Request, res: Response) => {
    const response: IApiResponse = {
        success: false,
        message: `Маршрут ${req.method} ${req.url} не найден`
    };
    res.status(404).json(response);
});

app.use((err: Error, _req: Request, res: Response) => {
    console.error('❌ Глобальная ошибка:', err.stack);
    
    const response: IApiResponse = {
        success: false,
        message: 'Внутренняя ошибка сервера',
        errors: process.env.NODE_ENV === 'development' ? [err.message] : undefined
    };
    
    res.status(500).json(response);
});

const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} получен. Закрытие сервера...`);
    await closePool();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async (): Promise<void> => {
    try {
        const dbConnected = await connectDB();
        
        if (!dbConnected) {
            console.error('❌ Не удалось подключиться к базе данных. Сервер не запущен.');
            process.exit(1);
        }
        
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
            console.log(`📋 API доступен по адресу http://localhost:${PORT}/api/users`);
            console.log(`🔍 Проверка здоровья: http://localhost:${PORT}/health`);
            console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
            console.log('='.repeat(50) + '\n');
        });
        
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
};

startServer();