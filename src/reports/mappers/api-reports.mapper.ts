import { Injectable } from '@nestjs/common';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import {
  ReportActivePercentageResponseDto,
  ReportAvgPriceByCategoryResponseDto,
  ReportDeletedPercentageResponseDto,
} from '../dto/reports-response';

@Injectable()
export class ApiReportsMapper {
  mapDeletedPercentageResponseDto(
    deletedPercentage: number,
  ): ApiResponseDto<ReportDeletedPercentageResponseDto> {
    return {
      success: true,
      data: { deletedPercentage: Number(deletedPercentage.toFixed(4)) },
    };
  }

  mapActivePercentageResponseDto(
    activePercentage: number,
    avgPrice?: number | null,
  ): ApiResponseDto<ReportActivePercentageResponseDto> {
    if (avgPrice) {
      return {
        success: true,
        data: {
          activePercentage: Number(activePercentage.toFixed(4)),
          avgPrice: Number(avgPrice.toFixed(4)),
        },
      };
    }
    return {
      success: true,
      data: { activePercentage: Number(activePercentage.toFixed(4)) },
    };
  }

  mapAvgPriceByCategoryResponseDto(
    avgPriceByCategories: Array<{ category: string; avg: string }>,
  ): ApiResponseDto<ReportAvgPriceByCategoryResponseDto[]> {
    return {
      success: true,
      data: avgPriceByCategories.map((category) => ({
        category: category.category,
        avg: Number(Number(category.avg).toFixed(4)),
      })),
    };
  }
}
