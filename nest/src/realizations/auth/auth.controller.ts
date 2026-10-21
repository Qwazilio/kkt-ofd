import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.login(dto);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'production',
      maxAge: 12 * 60 * 60 * 1000,
    });
    return { ok: true };
  }

  @HttpCode(200)
  @Get('me')
  async me(@Req() req: Request) {
    return req?.user;
  }
}
