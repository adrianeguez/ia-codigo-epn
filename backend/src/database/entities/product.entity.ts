import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('products')
@Index(['name', 'sku'])
@Index(['categoryId', 'status'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  minStock: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  material: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'int', nullable: true })
  warranty: number;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mainImage: string;

  @Column({ type: 'text', nullable: true })
  images: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  video: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'int', nullable: true })
  createdById: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ type: 'int', nullable: true })
  updatedById: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de utilidad
  isInStock(): boolean {
    return this.stock > 0;
  }

  isLowStock(): boolean {
    return this.stock <= this.minStock;
  }

  isOnSale(): boolean {
    return this.salePrice !== null && this.salePrice < this.price;
  }

  getCurrentPrice(): number {
    return this.isOnSale() ? this.salePrice : this.price;
  }

  getDiscountPercentage(): number {
    if (!this.isOnSale()) return 0;
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
}
