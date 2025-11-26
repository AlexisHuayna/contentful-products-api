import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ description: 'Username', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}
