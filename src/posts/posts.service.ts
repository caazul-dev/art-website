import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Post {
  special_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: Date;
}

@Injectable()
export class PostsService {
  constructor(private readonly db: DatabaseService) {}

  async createPost(userId: number, title: string, content: string): Promise<Post> {
    const query = `
      INSERT INTO posts (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING special_id, user_id, title, content, created_at;
    `;
    const result = await this.db.query(query, [userId, title, content]);
    return result.rows[0];
  }

  async getAll(): Promise<Post[]> {
    const query = `
      SELECT special_id, user_id, title, content, created_at 
      FROM posts 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findBySpecialId(specialId: number): Promise<Post> {
    const query = `
      SELECT special_id, user_id, title, content, created_at 
      FROM posts 
      WHERE special_id = $1;
    `;
    const result = await this.db.query(query, [specialId]);
    if (!result.rows[0]) {
      throw new NotFoundException(`Post with ID ${specialId} not found`);
    }
    return result.rows[0];
  }

  async findByUserId(userId: number): Promise<Post[]> {
    const query = `
      SELECT special_id, user_id, title, content, created_at 
      FROM posts 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async updatePost(
    specialId: number,
    userId: number,
    title: string,
    content: string,
  ): Promise<Post> {
    const query = `
      UPDATE posts 
      SET title = $1, content = $2 
      WHERE special_id = $3 AND user_id = $4
      RETURNING special_id, user_id, title, content, created_at;
    `;
    const result = await this.db.query(query, [title, content, specialId, userId]);
    if (!result.rows[0]) {
      throw new NotFoundException(
        `Post with ID ${specialId} not found or unauthorized to update`,
      );
    }
    return result.rows[0];
  }

  async deletePost(specialId: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM posts 
      WHERE special_id = $1 AND user_id = $2;
    `;
    const result = await this.db.query(query, [specialId, userId]);
    if (result.rowCount === 0) {
      throw new NotFoundException(
        `Post with ID ${specialId} not found or unauthorized to delete`,
      );
    }
    return true;
  }
}