import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MetaService } from '../meta/meta.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private metaService: MetaService, private jwtService: JwtService) {}

  async validateMeta(username: string, pass: string) {
    const meta = await this.metaService.findByUsername(username);
    if (!meta) return null;
    const valid = await bcrypt.compare(pass, meta.password);
    if (valid) return { id: meta.id, username: meta.username, role: meta.role };
    return null;
  }

  async login(meta: { id: number; username: string; role: string }) {
    const payload = { sub: meta.id, username: meta.username, role: meta.role };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' } as jwt.SignOptions,
    );

    await this.metaService.setRefreshToken(meta.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(metaId: number) {
    await this.metaService.setRefreshToken(metaId, null);
    return { ok: true };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret');
      const meta = await this.metaService.findById(decoded.sub);
      if (!meta) throw new UnauthorizedException('Invalid refresh token');

      const found = await this.metaService.findByRefreshToken(refreshToken);
      if (!found) throw new UnauthorizedException('Invalid refresh token (not found)');

      const payload = { sub: found.id, username: found.username, role: found.role };
      const accessToken = this.jwtService.sign(payload);
      const newRefresh = jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' } as jwt.SignOptions,
      );
      await this.metaService.setRefreshToken(found.id, newRefresh);
      return { accessToken, refreshToken: newRefresh };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}