import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { Product } from 'src/products/entities/product';
import { ProductRepository } from 'src/products/repositories/product.repository';
import { ApiReportsMapper } from './mappers/api-reports.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ReportsController],
  providers: [ReportsService, ProductRepository, ApiReportsMapper],
})
export class ReportsModule {}
