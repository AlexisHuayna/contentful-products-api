import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto } from '../dto/auth-login';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('auth')
@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOkResponse({ type: ApiResponseDto<{ accessToken: string }>, description: 'Login response' })
    async login(@Body() loginDto: AuthLoginDto): Promise<ApiResponseDto<{ accessToken: string }>> {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);

        return {
            success: true,
            data: await this.authService.login(user),
        };
    }
}