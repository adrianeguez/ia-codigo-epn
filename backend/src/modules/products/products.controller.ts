import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ProductsService,
  ProductFilters,
  PaginationOptions,
} from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStatus } from '../../database/entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: Product,
  })
  @ApiResponse({
    status: 409,
    description: 'El SKU ya existe',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: RequestWithUser,
  ) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de productos con filtros y paginación',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Término de búsqueda',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'ID de categoría',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'draft'],
    description: 'Estado del producto',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Precio mínimo',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Precio máximo',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'En stock',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    type: Boolean,
    description: 'Destacado',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    type: String,
    description: 'Marca',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: String,
    description: 'Etiquetas',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Campo de ordenamiento',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Dirección de ordenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('brand') brand?: string,
    @Query('tags') tags?: string,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: string,
  ) {
    const filters: ProductFilters = {};

    if (search) filters.search = search;
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (status) filters.status = status as ProductStatus;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
    if (brand) filters.brand = brand;
    if (tags) filters.tags = tags;

    const pagination: PaginationOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    if (orderBy) pagination.orderBy = orderBy;
    if (orderDirection)
      pagination.orderDirection = orderDirection as 'ASC' | 'DESC';

    return this.productsService.findAll(filters, pagination);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de productos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getStats() {
    return this.productsService.getProductStats();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener productos con stock bajo' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos con stock bajo obtenidos exitosamente',
    type: [Product],
  })
  async getLowStockProducts(@Query('limit') limit: string = '10') {
    return this.productsService.getLowStockProducts(parseInt(limit));
  }

  @Get('out-of-stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener productos agotados' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos agotados obtenidos exitosamente',
    type: [Product],
  })
  async getOutOfStockProducts(@Query('limit') limit: string = '10') {
    return this.productsService.getOutOfStockProducts(parseInt(limit));
  }

  @Get('featured')
  @ApiOperation({ summary: 'Obtener productos destacados' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos destacados obtenidos exitosamente',
    type: [Product],
  })
  async getFeaturedProducts(@Query('limit') limit: string = '10') {
    return this.productsService.getFeaturedProducts(parseInt(limit));
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Obtener productos por categoría' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos de la categoría obtenidos exitosamente',
    type: [Product],
  })
  async getProductsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('limit') limit: string = '20',
  ) {
    return this.productsService.getProductsByCategory(
      categoryId,
      parseInt(limit),
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar productos' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Término de búsqueda',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
    type: [Product],
  })
  async searchProducts(
    @Query('q') searchTerm: string,
    @Query('limit') limit: string = '20',
  ) {
    return this.productsService.searchProducts(searchTerm, parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El SKU ya existe',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: RequestWithUser,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(id);
  }
}
