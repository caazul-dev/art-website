import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  comment_text: string;
  created_at: Date;
}

@Injectable()
export class CommentsService {
  constructor(private readonly db: DatabaseService) {}

  async createComment(postId: number, userId: number, commentText: string): Promise<Comment> {
    const query = `
      INSERT INTO comments (post_id, user_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING id, post_id, user_id, comment_text, created_at;
    `;
    const result = await this.db.query(query, [postId, userId, commentText]);
    return result.rows[0];
  }

  async findById(id: number): Promise<Comment> {
    const query = `
      SELECT id, post_id, user_id, comment_text, created_at 
      FROM comments 
      WHERE id = $1;
    `;
    const result = await this.db.query(query, [id]);
    if (!result.rows[0]) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async findByPostId(postId: number): Promise<Comment[]> {
    const query = `
      SELECT id, post_id, user_id, comment_text, created_at 
      FROM comments 
      WHERE post_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query, [postId]);
    return result.rows;
  }

  async findByUserId(userId: number): Promise<Comment[]> {
    const query = `
      SELECT id, post_id, user_id, comment_text, created_at 
      FROM comments 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async getAll(): Promise<Comment[]> {
    const query = `
      SELECT id, post_id, user_id, comment_text, created_at 
      FROM comments 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async updateComment(id: number, userId: number, commentText: string): Promise<Comment> {
    const query = `
      UPDATE comments 
      SET comment_text = $1 
      WHERE id = $2 AND user_id = $3
      RETURNING id, post_id, user_id, comment_text, created_at;
    `;
    const result = await this.db.query(query, [commentText, id, userId]);
    if (!result.rows[0]) {
      throw new NotFoundException(`Comment with ID ${id} not found or unauthorized to update`);
    }
    return result.rows[0];
  }

  async deleteComment(id: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM comments 
      WHERE id = $1 AND user_id = $2;
    `;
    const result = await this.db.query(query, [id, userId]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found or unauthorized to delete`);
    }
    return true;
  }
}