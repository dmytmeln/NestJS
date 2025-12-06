import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserProfileDto> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: UserRole.ATTENDEE,
    });
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      role: user.role,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<{
        sub: number;
        email: string;
        role: UserRole;
      }>(refreshToken);

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, {
          expiresIn: '7d',
        }),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: number): Promise<UserProfileDto> {
    const user = await this.userService.findEntity(userId);
    return new UserProfileDto(user);
  }
}
