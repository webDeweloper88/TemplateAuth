import { ApiProperty } from '@nestjs/swagger';
import { ResponseUserDto } from '@modules/user/dto/response-user.dto';
import { IsString } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty({ example: 'jwt_access_token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'jwt_refresh_token' })
  @IsString()
  refreshToken: string;

  @ApiProperty({ type: () => ResponseUserDto })
  user: ResponseUserDto;
}
