import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode,HttpStatus,
} from '@nestjs/common';
import { CommentsService, Comment } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body() body: { postId: number; userId: number; commentText: string },
  ): Promise<Comment> {
    return this.commentsService.createComment(
      body.postId,
      body.userId,
      body.commentText,
    );
  }

  @Get()
  async getAll(): Promise<Comment[]> {
    return this.commentsService.getAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentsService.findById(id);
  }

  @Get('post/:postId')
  async findByPostId(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return this.commentsService.findByPostId(postId);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Comment[]> {
    return this.commentsService.findByUserId(userId);
  }

  @Put(':id')
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; commentText: string },
  ): Promise<Comment> {
    return this.commentsService.updateComment(id, body.userId, body.commentText);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number },
  ): Promise<void> {
    await this.commentsService.deleteComment(id, body.userId);
  }
}