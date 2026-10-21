import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService, User } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password?: string) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    
    // 1. Create the user in the database
    const newUser = await this.usersService.createUser(username, hashedPassword);

    // 2. Automatically log them in and save the refresh token
    return this.login(newUser);
  }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any },
    );

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    try {
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      );

      const user = await this.usersService.findById(userId);
      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const payload = { sub: user.id, username: user.username };
      const accessToken = this.jwtService.sign(payload);

      const newRefreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any },
      );

      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}