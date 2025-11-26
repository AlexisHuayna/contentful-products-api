export class ReportDeletedPercentageResponseDto {
  deletedPercentage: number;
}

export class ReportActivePercentageResponseDto {
  activePercentage: number;
  avgPrice?: number | null;
}

export class ReportAvgPriceByCategoryResponseDto {
  category: string;
  avg: number;
}
