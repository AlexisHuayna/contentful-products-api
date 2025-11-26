import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from './products.service';
import { ContentfulProductMapper } from '../mappers/contentful-product.mapper';
import { ContentfulService } from 'src/contentful/services/contentful.service';

@Injectable()
export class ProductSyncService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly contentfulProductMapper: ContentfulProductMapper,
    private readonly contentfulService: ContentfulService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncProducts() {
    try {
      const entries = await this.contentfulService.fetchProducts();
      const productUpsertDtos =
        this.contentfulProductMapper.mapEntriesToProductUpsertDtos(
          entries.items,
        );
      await this.productsService.upsertFromContentful(productUpsertDtos);
    } catch (error) {
      console.error(error);
    }
  }
}
