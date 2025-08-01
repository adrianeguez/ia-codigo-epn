import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService, DateRange } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Reportes')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('products/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtener estadísticas de productos' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de productos obtenidas exitosamente',
  })
  async getProductStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let dateRange: DateRange | undefined;

    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    return this.reportsService.getProductStats(dateRange);
  }

  @Get('categories/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtener estadísticas por categoría' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas por categoría obtenidas exitosamente',
  })
  async getCategoryStats() {
    return this.reportsService.getCategoryStats();
  }

  @Get('products/top')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtener productos más vistos' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos más vistos obtenidos exitosamente',
  })
  async getTopProducts(
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let dateRange: DateRange | undefined;

    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    return this.reportsService.getTopProducts(parseInt(limit), dateRange);
  }

  @Get('inventory/low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtener reporte de productos con stock bajo' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de stock bajo obtenido exitosamente',
  })
  async getLowStockReport(@Query('limit') limit: string = '20') {
    return this.reportsService.getLowStockReport(parseInt(limit));
  }

  @Get('inventory/out-of-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtener reporte de productos agotados' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de productos agotados obtenido exitosamente',
  })
  async getOutOfStockReport(@Query('limit') limit: string = '20') {
    return this.reportsService.getOutOfStockReport(parseInt(limit));
  }

  @Get('products/growth')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtener reporte de crecimiento de productos' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de crecimiento obtenido exitosamente',
  })
  async getProductGrowthReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const dateRange: DateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    return this.reportsService.getProductGrowthReport(dateRange);
  }

  @Get('inventory/value')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Obtener reporte de valor del inventario por categoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de valor del inventario obtenido exitosamente',
  })
  async getInventoryValueReport() {
    return this.reportsService.getInventoryValueReport();
  }

  @Get('users/activity')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener reporte de actividad de usuarios' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de actividad de usuarios obtenido exitosamente',
  })
  async getUserActivityReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let dateRange: DateRange | undefined;

    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    return this.reportsService.getUserActivityReport(dateRange);
  }

  @Get('system/health')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener reporte de salud del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Reporte de salud del sistema obtenido exitosamente',
  })
  async getSystemHealthReport() {
    return this.reportsService.getSystemHealthReport();
  }
}
