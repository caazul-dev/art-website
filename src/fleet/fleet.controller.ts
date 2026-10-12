import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { MetaService } from '../meta/meta.service';

@Controller('fleet')
export class FleetController {
  constructor(
    private readonly fleetService: FleetService,
    private readonly metaService: MetaService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string; role?: string }) {
    return this.metaService.createMeta(body.username, body.password, body.role);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { username: string; password: string }) {
    const meta = await this.fleetService.validateMeta(body.username, body.password);
    if (!meta) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.fleetService.login(meta);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { metaId: number }) {
    return this.fleetService.logout(body.metaId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    return this.fleetService.refreshTokens(body.refreshToken);
  }
}