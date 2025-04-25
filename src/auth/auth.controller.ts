import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/create-auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/guards/jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signUp(@Body() data: SignupDto) {
    const result = await this.authService.signup(data)
    return result ;
  }

  @Post('log-in')
  async login(@Body() data: LoginDto) {
    const result = await this.authService.login(data)
    return result ;
  }

  @Post('user/logout')
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
  ) {
    const userId = req['user'].id;
    const result = await this.authService.logout(userId)
    return result ;
  }

  @Get('me')
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @Req() req: Request,
  ) {
    const userId = req['user'].id;
    const result = await this.authService.getMe(userId)
    return result ;
  }

}
