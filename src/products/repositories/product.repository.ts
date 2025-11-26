import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { DataSource, FindOptionsWhere, ILike, In, InsertResult, Repository, SaveOptions, UpdateResult } from 'typeorm';
import { Product } from '../entities/product';
import { ProductFilters } from '../dto/product-filters';

const DEFAULT_PAGE_LIMIT = 5;
const MAX_PAGE_LIMIT = 5;

@Injectable()
export class ProductRepository extends Repository<Product> {
    constructor(private readonly dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async findPaginatedWithFilters(
        filters: ProductFilters,
    ): Promise<[Product[], number]> {
        const { page = 1, limit = DEFAULT_PAGE_LIMIT, name, category } = filters;

        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }

        if (limit < 1 || limit > MAX_PAGE_LIMIT) {
            throw new BadRequestException(
                `Limit must be between 1 and ${MAX_PAGE_LIMIT}`,
            );
        }

        const whereConditions: FindOptionsWhere<Product> = {
            deleted: false,
        };

        if (name) {
            whereConditions.name = ILike(`%${name}%`);
        }

        if (category) {
            whereConditions.category = ILike(`%${category}%`);
        }

        return this.findAndCount({
            where: whereConditions,
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async findByExternalIds(externalIds: string[]): Promise<Product[]> {
        return this.find({ where: { externalId: In(externalIds) }, withDeleted: true });
    }

    async softDeleteById(id: string): Promise<UpdateResult> {
        const product = await this.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return this.update(id, { deleted: true, deletedAt: new Date() });
    }

    async getAveragePrice(startDate: Date, endDate: Date): Promise<number | null> {
        const result = await this.createQueryBuilder('product')
            .select('AVG(product.price)', 'avg')
            .where('product.deleted = :deleted', { deleted: false })
            .andWhere('product.contentCreatedAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .getRawOne();

        return result?.avg ? parseFloat(result.avg) : null;
    }

    async getAveragePriceByCategories(): Promise<any> {
        return this.createQueryBuilder('product')
            .select('product.category', 'category')
            .addSelect('AVG(product.price)', 'avg')
            .where('product.deleted = :deleted', { deleted: false })
            .groupBy('product.category')
            .getRawMany();
    }
}
