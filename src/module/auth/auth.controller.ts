import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserProfileDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto): Promise<AuthResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getProfile(
    @Request() req: { user: { userId: number } },
  ): Promise<UserProfileDto> {
    return this.authService.validateUser(req.user.userId);
  }
}
