import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login';

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: AuthLoginDto): Promise<{ accessToken: string }> {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);

        return this.authService.login(user);
    }
}