import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    default: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser válido' })
  role?: UserRole;

  @ApiProperty({
    description: 'Departamento del usuario',
    example: 'Ventas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  department?: string;

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle Principal 123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;
}
