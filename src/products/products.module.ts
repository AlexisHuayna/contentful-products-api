import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { Product } from './entities/product';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repositories/product.repository';
import { ContentfulProductMapper } from './mappers/contentful-product.mapper';
import { ProductSyncService } from './services/product-sync.service';
import { ContentfulModule } from 'src/contentful/contentful.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ContentfulModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, ContentfulProductMapper, ProductSyncService]
})
export class ProductsModule {}
