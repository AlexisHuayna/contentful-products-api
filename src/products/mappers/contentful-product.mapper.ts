import { ProductUpsertDto } from "../dto/product-upsert";
import { ContentfulProductItem } from "src/types/contentful-product.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ContentfulProductMapper {
    mapEntryToProductUpsertDto(entry: ContentfulProductItem): ProductUpsertDto {
        const { sys, fields } = entry;

        const dto: ProductUpsertDto = {
            externalId: sys.id,

            sku: fields?.sku ?? null,
            name: fields?.name ?? '',

            brand: fields?.brand ?? null,
            model: fields?.model ?? null,
            category: fields?.category ?? null,
            color: fields?.color ?? null,

            price: fields?.price ?? null,
            currency: fields?.currency ?? null,
            stock: fields?.stock ?? null,

            contentCreatedAt: sys?.createdAt ? new Date(sys.createdAt) : null,
            contentUpdatedAt: sys?.updatedAt ? new Date(sys.updatedAt) : null,
        };

        return dto;
    }

    mapEntriesToProductUpsertDtos(entries: ContentfulProductItem[]): ProductUpsertDto[] {
        return entries.map(this.mapEntryToProductUpsertDto);
    }
}