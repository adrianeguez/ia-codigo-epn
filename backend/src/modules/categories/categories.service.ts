import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository, IsNull } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verificar si el nombre ya existe en el mismo nivel
    const whereCondition = createCategoryDto.parentId
      ? { name: createCategoryDto.name, parentId: createCategoryDto.parentId }
      : { name: createCategoryDto.name, parentId: IsNull() };

    const existingCategory = await this.categoryRepository.findOne({
      where: whereCondition,
    });

    if (existingCategory) {
      throw new ConflictException(
        'Ya existe una categoría con ese nombre en el mismo nivel',
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findTrees();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Verificar si el nombre ya existe en el mismo nivel
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const parentId = updateCategoryDto.parentId || category.parentId;
      const whereCondition = parentId
        ? { name: updateCategoryDto.name, parentId }
        : { name: updateCategoryDto.name, parentId: IsNull() };

      const existingCategory = await this.categoryRepository.findOne({
        where: whereCondition,
      });

      if (existingCategory) {
        throw new ConflictException(
          'Ya existe una categoría con ese nombre en el mismo nivel',
        );
      }
    }

    // Verificar que no se cree un ciclo
    if (updateCategoryDto.parentId) {
      const wouldCreateCycle = await this.wouldCreateCycle(
        id,
        updateCategoryDto.parentId,
      );
      if (wouldCreateCycle) {
        throw new ConflictException(
          'No se puede mover la categoría: se crearía un ciclo',
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Verificar si tiene productos
    const hasProducts = await this.categoryHasProducts(id);
    if (hasProducts) {
      throw new ConflictException(
        'No se puede eliminar la categoría: tiene productos asociados',
      );
    }

    // Verificar si tiene subcategorías
    const hasChildren = await this.categoryHasChildren(id);
    if (hasChildren) {
      throw new ConflictException(
        'No se puede eliminar la categoría: tiene subcategorías',
      );
    }

    await this.categoryRepository.remove(category);
  }

  async getRootCategories(): Promise<Category[]> {
    return this.categoryRepository.findRoots();
  }

  async getChildren(id: number): Promise<Category[]> {
    const category = await this.findOne(id);
    return this.categoryRepository.findDescendants(category);
  }

  async getParents(id: number): Promise<Category[]> {
    const category = await this.findOne(id);
    return this.categoryRepository.findAncestors(category);
  }

  async moveCategory(id: number, newParentId: number): Promise<Category> {
    const category = await this.findOne(id);
    const newParent = await this.findOne(newParentId);

    // Verificar que no se cree un ciclo
    const wouldCreateCycle = await this.wouldCreateCycle(id, newParentId);
    if (wouldCreateCycle) {
      throw new ConflictException(
        'No se puede mover la categoría: se crearía un ciclo',
      );
    }

    category.parent = newParent;
    return this.categoryRepository.save(category);
  }

  async getCategoryStats() {
    const totalCategories = await this.categoryRepository.count();
    const rootCategories = await this.categoryRepository.count({
      where: { parentId: IsNull() },
    });
    const categoriesWithProducts = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.products', 'product')
      .getCount();

    return {
      total: totalCategories,
      root: rootCategories,
      withProducts: categoriesWithProducts,
    };
  }

  private async wouldCreateCycle(
    categoryId: number,
    newParentId: number,
  ): Promise<boolean> {
    if (categoryId === newParentId) {
      return true;
    }

    const newParent = await this.findOne(newParentId);
    const newParentAncestors =
      await this.categoryRepository.findAncestors(newParent);

    return newParentAncestors.some((ancestor) => ancestor.id === categoryId);
  }

  private async categoryHasProducts(categoryId: number): Promise<boolean> {
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.products', 'product')
      .where('category.id = :categoryId', { categoryId })
      .getCount();

    return result > 0;
  }

  private async categoryHasChildren(categoryId: number): Promise<boolean> {
    const category = await this.findOne(categoryId);
    const children = await this.categoryRepository.findDescendants(category);
    return children.length > 1; // > 1 porque incluye la categoría misma
  }
}
