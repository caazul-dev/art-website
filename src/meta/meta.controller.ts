import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meta')
export class MetaController {
  constructor(private metaService: MetaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.metaService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.metaService.findById(+id);
  }

  @Post()
  async create(@Body() body: { username: string; password: string }) {
    return this.metaService.createMeta(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.metaService.updateMeta(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.metaService.deleteMeta(+id);
  }
}