export interface IUser {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    created_at: number;
    updated_at: number;
}

export interface IUserCreate {
    first_name: string;
    last_name: string;
    age: number;
}

export interface IUserUpdate {
    first_name?: string;
    last_name?: string;
    age?: number;
}

export interface IUserDB {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    created_at: Date;
    updated_at: Date;
}

export interface IApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    errors?: string[];
}

export interface IUserRequest {
    first_name: string;
    last_name: string;
    age: number;
}

export interface IParams {
    id: string;
}

export interface IValidationError {
    field: string;
    message: string;
}

export interface IDBConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}