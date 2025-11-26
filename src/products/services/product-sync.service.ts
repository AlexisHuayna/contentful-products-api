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
    ) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async syncProducts() {
        console.log('EXECUTING PRODUCT SYNC');
    }
}
