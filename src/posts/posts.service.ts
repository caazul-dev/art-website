import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Post {
  special_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at?: Date;
}

@Injectable()
export class PostsService {
  constructor(private readonly db: DatabaseService) {}

  async createPost(userId: number, title: string, content: string): Promise<Post> {
    const query = `
      INSERT INTO posts (user_id, title, content)
      VALUES (?, ?, ?);
    `;
    const [result]: any = await this.db.query(query, [userId, title, content]);
    
    // Fetch and return the inserted post using MySQL's insertId
    return this.findBySpecialId(result.insertId);
  }

  async getAll(): Promise<Post[]> {
    const query = `
      SELECT special_id, user_id, title, content, created_at 
      FROM posts 
      ORDER BY created_at DESC;
    `;
    const [rows]: any = await this.db.query(query);
    return rows;
  }

  async findBySpecialId(specialId: number): Promise<Post> {
    const query = `
      SELECT special_id, user_id, title, content, created_at 
      FROM posts 
      WHERE special_id = ?;
    `;
    const [rows]: any = await this.db.query(query, [specialId]);
    if (!rows[0]) {
      throw new NotFoundException(`Post with ID ${specialId} not found`);
    }
    return rows[0];
  }

  async findByUserId(userId: number): Promise<Post[]> {
    const query = `
      SELECT special_id, user_id, title, content, created_at 
      FROM posts 
      WHERE user_id = ? 
      ORDER BY created_at DESC;
    `;
    const [rows]: any = await this.db.query(query, [userId]);
    return rows;
  }

  async updatePost(
    specialId: number,
    userId: number,
    title: string,
    content: string,
  ): Promise<Post> {
    const query = `
      UPDATE posts 
      SET title = ?, content = ? 
      WHERE special_id = ? AND user_id = ?;
    `;
    const [result]: any = await this.db.query(query, [title, content, specialId, userId]);
    
    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Post with ID ${specialId} not found or unauthorized to update`,
      );
    }
    
    return this.findBySpecialId(specialId);
  }

  async deletePost(specialId: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM posts 
      WHERE special_id = ? AND user_id = ?;
    `;
    const [result]: any = await this.db.query(query, [specialId, userId]);
    
    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Post with ID ${specialId} not found or unauthorized to delete`,
      );
    }
    return true;
  }
}