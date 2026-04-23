import { query } from '../config/database';
import { IUser, IUserCreate, IUserUpdate, IUserDB } from '../types';

class User {
    private static toApiFormat(dbUser: IUserDB): IUser {
        return {
            id: dbUser.id,
            first_name: dbUser.first_name,
            last_name: dbUser.last_name,
            age: dbUser.age,
            created_at: Math.floor(dbUser.created_at.getTime() / 1000),
            updated_at: Math.floor(dbUser.updated_at.getTime() / 1000),
        };
    }

    static async create(userData: IUserCreate): Promise<IUser> {
        const { first_name, last_name, age } = userData;
        const queryText = `
            INSERT INTO users (first_name, last_name, age)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [first_name, last_name, age];
        const result = await query<IUserDB>(queryText, values);
        return this.toApiFormat(result.rows[0]);
    }

    static async findAll(): Promise<IUser[]> {
        const queryText = `
            SELECT id, first_name, last_name, age, created_at, updated_at
            FROM users 
            ORDER BY id
        `;
        const result = await query<IUserDB>(queryText);
        return result.rows.map(row => this.toApiFormat(row));
    }

    static async findById(id: number): Promise<IUser | null> {
        const queryText = `
            SELECT id, first_name, last_name, age, created_at, updated_at
            FROM users 
            WHERE id = $1
        `;
        const result = await query<IUserDB>(queryText, [id]);
        return result.rows[0] ? this.toApiFormat(result.rows[0]) : null;
    }

    static async update(id: number, userData: IUserUpdate): Promise<IUser | null> {
        const { first_name, last_name, age } = userData;
        
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;
        
        if (first_name !== undefined) {
            updates.push(`first_name = $${paramCounter++}`);
            values.push(first_name);
        }
        if (last_name !== undefined) {
            updates.push(`last_name = $${paramCounter++}`);
            values.push(last_name);
        }
        if (age !== undefined) {
            updates.push(`age = $${paramCounter++}`);
            values.push(age);
        }
        
        if (updates.length === 0) {
            return this.findById(id);
        }
        
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        
        const queryText = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING id, first_name, last_name, age, created_at, updated_at
        `;
        
        const result = await query<IUserDB>(queryText, values);
        return result.rows[0] ? this.toApiFormat(result.rows[0]) : null;
    }

    static async delete(id: number): Promise<boolean> {
        const queryText = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const result = await query<{ id: number }>(queryText, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    static async count(): Promise<number> {
        const queryText = 'SELECT COUNT(*) as count FROM users';
        const result = await query<{ count: string }>(queryText);
        return parseInt(result.rows[0].count);
    }

    static async searchByFirstName(firstName: string): Promise<IUser[]> {
        const queryText = `
            SELECT id, first_name, last_name, age, created_at, updated_at
            FROM users 
            WHERE first_name ILIKE $1
            ORDER BY id
        `;
        const result = await query<IUserDB>(queryText, [`%${firstName}%`]);
        return result.rows.map(row => this.toApiFormat(row));
    }
}

export default User;