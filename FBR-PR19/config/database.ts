import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';
import { IDBConfig } from '../types';

dotenv.config();

const dbConfig: IDBConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'user_management',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

pool.on('error', (err: Error) => {
    console.error('❌ Неожиданная ошибка пула PostgreSQL:', err);
    process.exit(1);
});

export const query = async <T extends Record<string, any> = any>(
    text: string, 
    params?: any[]
): Promise<QueryResult<T>> => {
    const start = Date.now();
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
        console.log('📊 Выполнен запрос:', { text, duration, rows: result.rowCount });
    }
    
    return result;
};

export const getClient = async (): Promise<PoolClient> => {
    return await pool.connect();
};

export const connectDB = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL подключена успешно');
        
        client.release();
        
        await initDatabase();
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к PostgreSQL:', error);
        return false;
    }
};

const initDatabase = async (): Promise<void> => {
    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                age INTEGER CHECK (age >= 0 AND age <= 150),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
            CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
            CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
        `;
        
        await query(createTableSQL);
        console.log('✅ Таблица users проверена/создана');
        
        const createTriggerSQL = `
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `;
        
        await query(createTriggerSQL);
        console.log('✅ Триггер для updated_at настроен');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error);
        throw error;
    }
};

export const closePool = async (): Promise<void> => {
    await pool.end();
    console.log('🔌 Соединение с PostgreSQL закрыто');
};

export default { query, getClient, connectDB, closePool };