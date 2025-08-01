import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  brand?: string;
  tags?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    // Verificar si el SKU ya existe
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('El SKU ya existe');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      createdById: userId,
      updatedById: userId,
    });

    return this.productRepository.save(product);
  }

  async findAll(
    filters: ProductFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ) {
    const {
      page,
      limit,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
    } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('product.updatedBy', 'updatedBy');

    // Aplicar filtros
    if (filters.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('product.status = :status', {
        status: filters.status,
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });
      } else if (filters.minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', {
          minPrice: filters.minPrice,
        });
      } else if (filters.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', {
          maxPrice: filters.maxPrice,
        });
      }
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        queryBuilder.andWhere('product.stock > 0');
      } else {
        queryBuilder.andWhere('product.stock = 0');
      }
    }

    if (filters.isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    if (filters.brand) {
      queryBuilder.andWhere('product.brand LIKE :brand', {
        brand: `%${filters.brand}%`,
      });
    }

    if (filters.tags) {
      queryBuilder.andWhere('product.tags LIKE :tags', {
        tags: `%${filters.tags}%`,
      });
    }

    // Aplicar ordenamiento
    queryBuilder.orderBy(`product.${orderBy}`, orderDirection);

    // Aplicar paginación
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'createdBy', 'updatedBy'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Incrementar contador de visualizaciones
    product.viewCount += 1;
    await this.productRepository.save(product);

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Verificar si el SKU ya existe (si se está cambiando)
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingProduct) {
        throw new ConflictException('El SKU ya existe');
      }
    }

    Object.assign(product, {
      ...updateProductDto,
      updatedById: userId,
    });

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getLowStockProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .andWhere('product.stock > 0')
      .orderBy('product.stock', 'ASC')
      .limit(limit)
      .getMany();
  }

  async getOutOfStockProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock = 0')
      .orderBy('product.updatedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.updatedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getProductsByCategory(
    categoryId: number,
    limit: number = 20,
  ): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.categoryId = :categoryId', { categoryId })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getProductStats() {
    const totalProducts = await this.productRepository.count();
    const activeProducts = await this.productRepository.count({
      where: { status: ProductStatus.ACTIVE },
    });
    const outOfStockProducts = await this.productRepository.count({
      where: { stock: 0 },
    });
    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .andWhere('product.stock > 0')
      .getCount();

    return {
      total: totalProducts,
      active: activeProducts,
      outOfStock: outOfStockProducts,
      lowStock: lowStockProducts,
    };
  }

  async searchProducts(
    searchTerm: string,
    limit: number = 20,
  ): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where(
        'product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search',
        { search: `%${searchTerm}%` },
      )
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.viewCount', 'DESC')
      .limit(limit)
      .getMany();
  }
}
