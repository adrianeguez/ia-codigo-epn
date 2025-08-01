import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónicos',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Productos electrónicos y tecnología',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiProperty({
    description: 'Imagen de la categoría',
    example: 'https://example.com/category.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  image?: string;

  @ApiProperty({
    description: 'Color de la categoría',
    example: '#FF5733',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El color debe ser una cadena de texto' })
  color?: string;

  @ApiProperty({
    description: 'Si la categoría está activa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'ID de la categoría padre',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de categoría padre debe ser un número' })
  parentId?: number;
}
