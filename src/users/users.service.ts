import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  username: string;
  password?: string;
  refresh_token?: string | null;
  created_at: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async createUser(
    username: string,
    password?: string,
  ): Promise<User> {
    const insertQuery = `
      INSERT INTO users (username, password)
      VALUES (?, ?)
    `;
    const result = await this.db.query<ResultSetHeader>(insertQuery, [
      username,
      password || null,
    ]);
    return this.findById(result.insertId);
  }

  async getAll(): Promise<User[]> {
    const query = `
      SELECT id, username, refresh_token, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    return this.db.query<User[]>(query);
  }

  async findById(id: number): Promise<User> {
    const query = `
      SELECT id, username, refresh_token, created_at 
      FROM users 
      WHERE id = ?
    `;
    const rows = await this.db.query<User[]>(query, [id]);
    if (!rows[0]) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return rows[0];
  }

  async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, password, refresh_token, created_at 
      FROM users 
      WHERE username = ?
    `;
    const rows = await this.db.query<User[]>(query, [username]);
    return rows[0] || null;
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string | null,
  ): Promise<void> {
    const query = `
      UPDATE users 
      SET refresh_token = ? 
      WHERE id = ?
    `;
    await this.db.query<ResultSetHeader>(query, [refreshToken, id]);
  }

  async updateUser(
    id: number,
    username?: string,
    password?: string,
  ): Promise<User> {
    const currentUser = await this.findById(id);
    const updatedUsername = username ?? currentUser.username;

    let updateQuery = `
      UPDATE users 
      SET username = ?
    `;
    const params: any[] = [updatedUsername];

    if (password) {
      updateQuery += `, password = ?`;
      params.push(password);
    }

    updateQuery += ` WHERE id = ?`;
    params.push(id);

    const result = await this.db.query<ResultSetHeader>(updateQuery, params);
    if (result.affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found or update failed`);
    }

    return this.findById(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const deleteQuery = `
      DELETE FROM users 
      WHERE id = ?
    `;
    const result = await this.db.query<ResultSetHeader>(deleteQuery, [id]);
    if (result.affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return true;
  }
}