import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    externalId: string;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column()
    price: number;

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ default: false })
    deleted: boolean;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}
