import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AxiomService } from './axiom.service';
import { MetaService } from '../meta/meta.service';

@Controller('axiom')
export class AxiomController {
  constructor(
    private readonly axiomService: AxiomService,
    private readonly metaService: MetaService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string; role?: string }) {
    return this.metaService.createMeta(body.username, body.password, body.role);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    const meta = await this.axiomService.validateMeta(body.username, body.password);
    if (!meta) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.axiomService.login(meta);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { metaId: number }) {
    return this.axiomService.logout(body.metaId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    return this.axiomService.refreshTokens(body.refreshToken);
  }
}