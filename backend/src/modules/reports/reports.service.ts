import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { Category } from '../../database/entities/category.entity';
import { User } from '../../database/entities/user.entity';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue: number;
  averagePrice: number;
}

interface CategoryStats {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
}

interface TopProduct {
  id: number;
  name: string;
  viewCount: number;
  categoryName: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  categoryName: string;
}

interface OutOfStockProduct {
  id: number;
  name: string;
  sku: string;
  lastStockDate: Date;
  categoryName: string;
}

interface ProductGrowth {
  date: string;
  count: number;
}

interface InventoryValue {
  categoryName: string;
  totalValue: number;
  productCount: number;
}

interface UserActivity {
  id: number;
  name: string;
  email: string;
  lastLoginAt: Date;
  productsCreated: number;
  productsUpdated: number;
}

interface SystemHealth {
  databaseStatus: string;
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  activeUsers: number;
  systemUptime: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProductStats(dateRange?: DateRange): Promise<ProductStats> {
    let queryBuilder = this.productRepository.createQueryBuilder('product');

    if (dateRange) {
      queryBuilder = queryBuilder.where(
        'product.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      );
    }

    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalValueResult,
      averagePriceResult,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('product.status = :status', { status: 'active' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('product.status = :status', { status: 'inactive' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('product.status = :status', { status: 'draft' })
        .getCount(),
      queryBuilder.clone().andWhere('product.stock = 0').getCount(),
      queryBuilder
        .clone()
        .andWhere('product.stock <= product.minStock')
        .andWhere('product.stock > 0')
        .getCount(),
      queryBuilder
        .clone()
        .select('SUM(product.price * product.stock)', 'totalValue')
        .getRawOne(),
      queryBuilder
        .clone()
        .select('AVG(product.price)', 'averagePrice')
        .getRawOne(),
    ]);

    const totalValue = parseFloat(totalValueResult?.totalValue || '0');
    const averagePrice = parseFloat(averagePriceResult?.averagePrice || '0');

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalValue,
      averagePrice,
    };
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'COUNT(product.id) as productCount',
        'SUM(product.stock) as totalStock',
        'SUM(product.price * product.stock) as totalValue',
      ])
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();

    return result.map((item: any) => ({
      categoryId: parseInt(item.categoryId),
      categoryName: item.categoryName,
      productCount: parseInt(item.productCount),
      totalStock: parseInt(item.totalStock || '0'),
      totalValue: parseFloat(item.totalValue || '0'),
    }));
  }

  async getTopProducts(
    limit: number = 10,
    dateRange?: DateRange,
  ): Promise<TopProduct[]> {
    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.viewCount',
        'category.name as categoryName',
      ])
      .orderBy('product.viewCount', 'DESC')
      .limit(limit);

    if (dateRange) {
      queryBuilder = queryBuilder.where(
        'product.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      );
    }

    const result = await queryBuilder.getRawMany();

    return result.map((item: any) => ({
      id: parseInt(item.product_id),
      name: item.product_name,
      viewCount: parseInt(item.product_viewCount),
      categoryName: item.categoryName,
    }));
  }

  async getLowStockReport(limit: number = 20): Promise<LowStockProduct[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.stock',
        'product.minStock',
        'category.name as categoryName',
      ])
      .where('product.stock <= product.minStock')
      .andWhere('product.stock > 0')
      .orderBy('product.stock', 'ASC')
      .limit(limit)
      .getRawMany();

    return result.map((item: any) => ({
      id: parseInt(item.product_id),
      name: item.product_name,
      sku: item.product_sku,
      currentStock: parseInt(item.product_stock),
      minStock: parseInt(item.product_minStock),
      categoryName: item.categoryName,
    }));
  }

  async getOutOfStockReport(limit: number = 20): Promise<OutOfStockProduct[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'product.id',
        'product.name',
        'product.sku',
        'product.updatedAt as lastStockDate',
        'category.name as categoryName',
      ])
      .where('product.stock = 0')
      .orderBy('product.updatedAt', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item: any) => ({
      id: parseInt(item.product_id),
      name: item.product_name,
      sku: item.product_sku,
      lastStockDate: new Date(item.lastStockDate),
      categoryName: item.categoryName,
    }));
  }

  async getProductGrowthReport(dateRange: DateRange): Promise<ProductGrowth[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select(['DATE(product.createdAt) as date', 'COUNT(product.id) as count'])
      .where('product.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      .groupBy('DATE(product.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((item: any) => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }

  async getInventoryValueReport(): Promise<InventoryValue[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'category.name as categoryName',
        'SUM(product.price * product.stock) as totalValue',
        'COUNT(product.id) as productCount',
      ])
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('totalValue', 'DESC')
      .getRawMany();

    return result.map((item: any) => ({
      categoryName: item.categoryName,
      totalValue: parseFloat(item.totalValue || '0'),
      productCount: parseInt(item.productCount),
    }));
  }

  async getUserActivityReport(dateRange?: DateRange): Promise<UserActivity[]> {
    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email', 'user.lastLoginAt'])
      .orderBy('user.lastLoginAt', 'DESC');

    if (dateRange) {
      queryBuilder = queryBuilder.where(
        'user.lastLoginAt BETWEEN :startDate AND :endDate',
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      );
    }

    const users = await queryBuilder.getMany();

    const userActivityPromises = users.map(async (user) => {
      const [productsCreated, productsUpdated] = await Promise.all([
        this.productRepository.count({ where: { createdById: user.id } }),
        this.productRepository.count({ where: { updatedById: user.id } }),
      ]);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        lastLoginAt: user.lastLoginAt,
        productsCreated,
        productsUpdated,
      };
    });

    return Promise.all(userActivityPromises);
  }

  async getSystemHealthReport(): Promise<SystemHealth> {
    const [totalProducts, totalCategories, totalUsers, activeUsers] =
      await Promise.all([
        this.productRepository.count(),
        this.categoryRepository.count(),
        this.userRepository.count(),
        this.userRepository.count({ where: { isActive: true } }),
      ]);

    const systemUptime = process.uptime();

    return {
      databaseStatus: 'OK',
      totalProducts,
      totalCategories,
      totalUsers,
      activeUsers,
      systemUptime,
    };
  }
}
