import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.adminUser = {
      username: this.configService.get<string>('ADMIN_USERNAME') ?? 'admin',
      password: this.configService.get<string>('ADMIN_PASSWORD') ?? 'admin',
    };
  }

  private readonly adminUser: { username: string; password: string };

  validateUser(username: string, password: string) {
    if (
      username === this.adminUser.username &&
      password === this.adminUser.password
    ) {
      return { username, role: 'admin' };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  login(user: { username: string; role: string }) {
    const payload = { sub: user.username, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
