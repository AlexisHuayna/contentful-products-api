import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductFilters } from '../dto/product-filters';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductsService {

    constructor(private readonly productRepository: ProductRepository) {}

    findPaginated(filters: ProductFilters) {
        const { page = 1, limit = 5 } = filters;
        return this.productRepository.findPaginatedWithFilters(filters, page, limit);
    }

    softDelete(id: number){}

    upsertFromContentful(data: any){}
}
