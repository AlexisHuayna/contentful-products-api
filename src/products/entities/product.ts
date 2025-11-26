import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', unique: true })
  externalId: string;

  @Column({ type: 'int', nullable: true })
  sku: number | null;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  brand: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  model: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @Column({ type: 'numeric', nullable: true })
  price: number | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @Column({ type: 'int', nullable: true })
  stock: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  contentCreatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  contentUpdatedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Index()
  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
