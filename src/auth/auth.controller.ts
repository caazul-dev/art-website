import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MetaService } from '../meta/meta.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private metaService: MetaService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    return this.metaService.createMeta(body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const meta = await this.authService.validateMeta(body.username, body.password);
    if (!meta) return { error: 'Invalid credentials' };
    return this.authService.login(meta);
  }

  @Post('logout')
  async logout(@Body() body: { metaId: number }) {
    return this.authService.logout(body.metaId);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }
}