import { Injectable } from "@nestjs/common";
import { ProductResponseDto } from "../dto/product-response";
import { Product } from "../entities/product";

@Injectable()
export class ApiProductMapper {

    mapEntityToResponseDto(entity: Product): ProductResponseDto {
        return {
            id: entity.id,
            sku: entity.sku,
            name: entity.name,
            brand: entity.brand,
            model: entity.model,
            category: entity.category,
            color: entity.color,
            price: entity.price,
            currency: entity.currency,
            stock: entity.stock,
        };
    }
}