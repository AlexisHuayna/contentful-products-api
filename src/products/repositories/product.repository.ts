import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { DataSource, FindOptionsWhere, In, InsertResult, Repository, SaveOptions, UpdateResult } from 'typeorm';
import { Product } from '../entities/product';

const DEFAULT_PAGE_LIMIT = 5;
const MAX_PAGE_LIMIT = 5;

@Injectable()
export class ProductRepository extends Repository<Product> {
    constructor(private readonly dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }

    async findPaginatedWithFilters(
        filters: FindOptionsWhere<Product>,
        page: number,
        limit: number = DEFAULT_PAGE_LIMIT,
    ): Promise<[Product[], number]> {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }

        if (limit < 1 || limit > MAX_PAGE_LIMIT) {
            throw new BadRequestException(
                `Limit must be between 1 and ${MAX_PAGE_LIMIT}`,
            );
        }

        return this.findAndCount({
            where: filters,
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async findByExternalIds(externalIds: string[]): Promise<Product[]> {
        return this.find({ where: { externalId: In(externalIds) } });
    }

    async softDeleteById(id: string): Promise<UpdateResult> {
        const product = await this.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return this.update(id, { deleted: true, deletedAt: new Date() });
    }

    async save(
        data: Partial<Product>[],
        options?: SaveOptions,
    ): Promise<Product[]> {
        return super.save(data, options ?? {});
    }
}
