import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/products/repositories/product.repository';
import { Between } from 'typeorm';
import { ReportsActiveAvg } from '../dto/reports-active-avg';

@Injectable()
export class ReportsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getDeletedPercentage(): Promise<number> {
    const [deletedCount, totalCount] = await Promise.all([
      this.productRepository.count({
        where: { deleted: true },
        withDeleted: true,
      }),
      this.productRepository.count(),
    ]);

    const deletedPercentage =
      totalCount > 0 ? (deletedCount / totalCount) * 100 : 0;

    return deletedPercentage;
  }

  async getActivePercentage(parameters: ReportsActiveAvg) {
    const { withPrice = false, startDate, endDate } = parameters;

    const [activeCount, totalCount] = await Promise.all([
      this.productRepository.count({
        where: {
          deleted: false,
          contentCreatedAt: Between(startDate, endDate),
        },
      }),
      this.productRepository.count({
        where: { contentCreatedAt: Between(startDate, endDate) },
        withDeleted: true,
      }),
    ]);

    const activePercentage =
      totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

    if (withPrice) {
      const avgPrice = await this.productRepository.getAveragePrice(
        startDate,
        endDate,
      );

      return { activePercentage, avgPrice: avgPrice ?? 0 };
    }

    return { activePercentage };
  }

  async getAvgPriceByCategory(): Promise<
    Array<{ category: string; avg: string }>
  > {
    const avgPriceByCategories =
      await this.productRepository.getAveragePriceByCategories();
    return avgPriceByCategories ?? [];
  }
}
