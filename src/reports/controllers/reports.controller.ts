import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { ReportsService } from '../services/reports.service';
import { ReportsActiveAvg } from '../dto/reports-active-avg';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { ApiReportsMapper } from '../mappers/api-reports.mapper';
import { ReportActivePercentageResponseDto, ReportAvgPriceByCategoryResponseDto, ReportDeletedPercentageResponseDto } from '../dto/reports-response';

@UseGuards(JwtAuthGuard)
@Controller({
    path: 'reports',
    version: '1',
})
export class ReportsController {
    constructor(private readonly reportsService: ReportsService, private readonly apiReportsMapper: ApiReportsMapper) {}

    @Get('deleted-percentage')
    async getDeletedPercentage(): Promise<ApiResponseDto<ReportDeletedPercentageResponseDto>> {
        const deletedPercentage = await this.reportsService.getDeletedPercentage();
        return this.apiReportsMapper.mapDeletedPercentageResponseDto(deletedPercentage);

    }
  
    @Get('active-percentage')
    async getActivePercentage(@Query() query: ReportsActiveAvg): Promise<ApiResponseDto<ReportActivePercentageResponseDto>> {
      const { activePercentage, avgPrice } = await this.reportsService.getActivePercentage(query);
      return this.apiReportsMapper.mapActivePercentageResponseDto(activePercentage, avgPrice);
    }
  
    @Get('avg-price-by-category')
    async getAvgPriceByCategory(): Promise<ApiResponseDto<ReportAvgPriceByCategoryResponseDto[]>> {
      const avgPriceByCategories = await this.reportsService.getAvgPriceByCategory();
      return this.apiReportsMapper.mapAvgPriceByCategoryResponseDto(avgPriceByCategories);
    }
}
