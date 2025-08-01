import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../../database/entities/category.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una categoría con ese nombre en el mismo nivel',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las categorías en estructura de árbol',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías obtenidas exitosamente',
    type: [Category],
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('roots')
  @ApiOperation({ summary: 'Obtener solo las categorías raíz' })
  @ApiResponse({
    status: 200,
    description: 'Categorías raíz obtenidas exitosamente',
    type: [Category],
  })
  async getRootCategories() {
    return this.categoriesService.getRootCategories();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de categorías' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getStats() {
    return this.categoriesService.getCategoryStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({
    status: 200,
    description: 'Categoría obtenida exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Obtener subcategorías de una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Subcategorías obtenidas exitosamente',
    type: [Category],
  })
  async getChildren(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getChildren(id);
  }

  @Get(':id/parents')
  @ApiOperation({ summary: 'Obtener categorías padre de una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categorías padre obtenidas exitosamente',
    type: [Category],
  })
  async getParents(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getParents(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una categoría con ese nombre en el mismo nivel',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch(':id/move/:newParentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mover una categoría a otra categoría padre' })
  @ApiResponse({
    status: 200,
    description: 'Categoría movida exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede mover la categoría: se crearía un ciclo',
  })
  async moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('newParentId', ParseIntPipe) newParentId: number,
  ) {
    return this.categoriesService.moveCategory(id, newParentId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiResponse({
    status: 204,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  @ApiResponse({
    status: 409,
    description:
      'No se puede eliminar la categoría: tiene productos o subcategorías',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.remove(id);
  }
}
