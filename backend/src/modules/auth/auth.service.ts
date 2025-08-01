import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Actualizar último login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400, // 24 horas
      user: userResponse,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear nuevo usuario
    const user = this.userRepository.create({
      ...registerDto,
      role: registerDto.role || UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    // Generar token
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const userResponse: UserResponseDto = {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
    };

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: userResponse,
    };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token inválido');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
