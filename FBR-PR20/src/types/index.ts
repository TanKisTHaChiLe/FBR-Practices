export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  created_at: number;
  updated_at: number;
}

export interface IUserInput {
  first_name: string;
  last_name: string;
  age: number;
}