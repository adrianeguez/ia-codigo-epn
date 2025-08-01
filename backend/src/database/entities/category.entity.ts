import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('categories')
@Tree('closure-table')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @Column({ type: 'int', nullable: true })
  parentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método para obtener el nivel de profundidad
  getLevel(): number {
    let level = 0;
    let current = this.parent;
    while (current) {
      level++;
      current = current.parent;
    }
    return level;
  }

  // Método para verificar si es una categoría raíz
  isRoot(): boolean {
    return !this.parentId;
  }

  // Método para verificar si es una hoja (sin hijos)
  isLeaf(): boolean {
    return !this.children || this.children.length === 0;
  }
}
