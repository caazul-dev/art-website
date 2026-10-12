import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DivisionService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createDivision(username: string, password: string, role = 'user') {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO division (username, password, role) VALUES (?, ?, ?)',
      [username, hashed, role],
    );
    return { id: result.insertId, username, role };
  }

  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, password, role, refresh_token FROM division WHERE username = ?',
      [username],
    );
    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM division WHERE id = ?',
      [id],
    );
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role, created_at FROM division',
    );
    return rows;
  }

  async updateDivision(id: number, partial: { username?: string; password?: string; role?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }
    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }
    if (fields.length === 0) return await this.findById(id);
    values.push(id);
    const sql = `UPDATE division SET ${fields.join(', ')} WHERE id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(id);
  }

  async deleteDivision(id: number) {
    const [res] = await this.pool().execute<OkPacket>('DELETE FROM division WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute('UPDATE division SET refresh_token = ? WHERE id = ?', [refreshToken, id]);
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM division WHERE refresh_token = ?',
      [refreshToken],
    );
    return rows[0];
  }
}