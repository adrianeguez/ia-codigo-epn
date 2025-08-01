import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Si el usuario está activo',
    example: true,
  })
  isActive: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 86400,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Información del usuario',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
