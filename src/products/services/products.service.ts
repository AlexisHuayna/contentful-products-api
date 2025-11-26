import { Injectable } from '@nestjs/common';
import { ProductFilters } from '../dto/product-filters';
import { ProductRepository } from '../repositories/product.repository';
import { ProductUpsertDto } from '../dto/product-upsert';
import { Product } from '../entities/product';

const SAVE_CHUNK_SIZE = 100;

@Injectable()
export class ProductsService {

    constructor(private readonly productRepository: ProductRepository) { }

    findPaginated(filters: ProductFilters) {
        const { page = 1, limit = 5 } = filters;
        return this.productRepository.findPaginatedWithFilters(filters, page, limit);
    }

    deleteById(id: number) { }

    async upsertFromContentful(data: ProductUpsertDto[]): Promise<void> {
        if (!data.length) return;

        const externalIds = data.map(item => item.externalId);
        const existingProducts = await this.productRepository.findByExternalIds(externalIds);
        const existingByExternalId = new Map<string, Product>();
        existingProducts.forEach(product => {
            existingByExternalId.set(product.externalId, product);
        });

        const productsToSave: Partial<Product>[] = [];

        for (const dto of data) {
            const existingProduct = existingByExternalId.get(dto.externalId);
            if (existingProduct && existingProduct.deleted) {
                continue;
            }

            if (existingProduct) {
                this.mapDtoToExistingEntity(dto, existingProduct);
                productsToSave.push(existingProduct);
                continue;
            }

            const created = this.productRepository.create();
            this.mapDtoToNewEntity(dto, created);
            productsToSave.push(created);
        }

        this.productRepository.save(productsToSave, { chunk: SAVE_CHUNK_SIZE });
    }

    mapDtoToNewEntity(dto: ProductUpsertDto, created: Product) {
        created.externalId = dto.externalId;
        created.sku = dto.sku ?? null;
        created.name = dto.name;
        created.brand = dto.brand ?? null;
        created.model = dto.model ?? null;
        created.category = dto.category ?? null;
        created.color = dto.color ?? null;
        created.price = dto.price ?? null;
        created.currency = dto.currency ?? null;
        created.stock = dto.stock;
        created.contentCreatedAt = dto.contentCreatedAt ?? null;
        created.contentUpdatedAt = dto.contentUpdatedAt;
    }

    mapDtoToExistingEntity(dto: ProductUpsertDto, existingProduct: Product) {
        existingProduct.sku = dto.sku ?? null;
        existingProduct.name = dto.name;
        existingProduct.brand = dto.brand ?? null;
        existingProduct.model = dto.model ?? null;
        existingProduct.category = dto.category ?? null;
        existingProduct.color = dto.color ?? null;
        existingProduct.price = dto.price ?? null;
        existingProduct.currency = dto.currency ?? null;
        existingProduct.stock = dto.stock;
    }
}
