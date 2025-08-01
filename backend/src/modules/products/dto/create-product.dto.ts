import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../../../database/entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop HP Pavilion',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'SKU del producto',
    example: 'PROD-001',
    maxLength: 20,
  })
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El SKU no puede exceder 20 caracteres' })
  sku: string;

  @ApiProperty({
    description: 'Descripción corta del producto',
    example: 'Laptop de alto rendimiento',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción no puede exceder 200 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'Descripción larga del producto',
    example: 'Laptop HP Pavilion con procesador Intel i7...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción larga debe ser una cadena de texto' })
  longDescription?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 999.99,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @ApiProperty({
    description: 'Precio de oferta del producto',
    example: 899.99,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio de oferta debe ser un número' })
  @Min(0, { message: 'El precio de oferta no puede ser negativo' })
  salePrice?: number;

  @ApiProperty({
    description: 'Stock inicial del producto',
    example: 50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @ApiProperty({
    description: 'Stock mínimo del producto',
    example: 5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  minStock?: number;

  @ApiProperty({
    description: 'Peso del producto en kg',
    example: 2.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @Min(0, { message: 'El peso no puede ser negativo' })
  weight?: number;

  @ApiProperty({
    description: 'Largo del producto en cm',
    example: 35.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El largo debe ser un número' })
  @Min(0, { message: 'El largo no puede ser negativo' })
  length?: number;

  @ApiProperty({
    description: 'Ancho del producto en cm',
    example: 24.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ancho debe ser un número' })
  @Min(0, { message: 'El ancho no puede ser negativo' })
  width?: number;

  @ApiProperty({
    description: 'Alto del producto en cm',
    example: 2.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El alto debe ser un número' })
  @Min(0, { message: 'El alto no puede ser negativo' })
  height?: number;

  @ApiProperty({
    description: 'Color del producto',
    example: '#000000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El color debe ser una cadena de texto' })
  color?: string;

  @ApiProperty({
    description: 'Material del producto',
    example: 'Plástico',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El material debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El material no puede exceder 50 caracteres' })
  material?: string;

  @ApiProperty({
    description: 'Marca del producto',
    example: 'HP',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @MaxLength(50, { message: 'La marca no puede exceder 50 caracteres' })
  brand?: string;

  @ApiProperty({
    description: 'Modelo del producto',
    example: 'Pavilion 15',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El modelo debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El modelo no puede exceder 50 caracteres' })
  model?: string;

  @ApiProperty({
    description: 'Año de fabricación',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El año debe ser un número' })
  year?: number;

  @ApiProperty({
    description: 'Garantía en meses',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La garantía debe ser un número' })
  warranty?: number;

  @ApiProperty({
    description: 'Etiquetas del producto (separadas por comas)',
    example: 'laptop,computadora,portátil',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las etiquetas deben ser una cadena de texto' })
  tags?: string;

  @ApiProperty({
    description: 'Imagen principal del producto',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La imagen principal debe ser una URL válida' })
  mainImage?: string;

  @ApiProperty({
    description: 'Imágenes adicionales (separadas por comas)',
    example: 'https://example.com/img1.jpg,https://example.com/img2.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las imágenes deben ser una cadena de texto' })
  images?: string;

  @ApiProperty({
    description: 'Video del producto',
    example: 'https://youtube.com/watch?v=example',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'El video debe ser una URL válida' })
  video?: string;

  @ApiProperty({
    description: 'Estado del producto',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'El estado debe ser válido' })
  status?: ProductStatus;

  @ApiProperty({
    description: 'Si el producto es destacado',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo destacado debe ser un booleano' })
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Fecha de publicación',
    example: '2024-01-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de publicación debe ser una fecha válida' },
  )
  publishedAt?: string;

  @ApiProperty({
    description: 'Meta título para SEO',
    example: 'Laptop HP Pavilion - Mejor Precio',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El meta título debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El meta título no puede exceder 100 caracteres' })
  metaTitle?: string;

  @ApiProperty({
    description: 'Meta descripción para SEO',
    example: 'Laptop HP Pavilion con las mejores características...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La meta descripción debe ser una cadena de texto' })
  metaDescription?: string;

  @ApiProperty({
    description: 'Meta palabras clave para SEO',
    example: 'laptop,hp,pavilion,computadora',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'Las meta palabras clave deben ser una cadena de texto',
  })
  metaKeywords?: string;

  @ApiProperty({
    description: 'ID de la categoría',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  categoryId?: number;
}
