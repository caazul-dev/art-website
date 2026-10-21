import { Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService, Post as PostEntity } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(
    @Body() body: { userId: number; title: string; content: string },
  ): Promise<PostEntity> {
    return this.postsService.createPost(body.userId, body.title, body.content);
  }

  @Get()
  async getAll(): Promise<PostEntity[]> {
    return this.postsService.getAll();
  }

  @Get(':specialId')
  async findBySpecialId(
    @Param('specialId', ParseIntPipe) specialId: number,
  ): Promise<PostEntity> {
    return this.postsService.findBySpecialId(specialId);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<PostEntity[]> {
    return this.postsService.findByUserId(userId);
  }

  @Put(':specialId')
  async updatePost(
    @Param('specialId', ParseIntPipe) specialId: number,
    @Body() body: { userId: number; title: string; content: string },
  ): Promise<PostEntity> {
    return this.postsService.updatePost(
      specialId,
      body.userId,
      body.title,
      body.content,
    );
  }

  @Delete(':specialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('specialId', ParseIntPipe) specialId: number,
    @Body() body: { userId: number },
  ): Promise<void> {
    await this.postsService.deletePost(specialId, body.userId);
  }
}