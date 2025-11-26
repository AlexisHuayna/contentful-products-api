import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class ReportsActiveAvg {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Include average price flag',
    required: false,
    default: false,
  })
  withPrice: boolean;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: 'Start date', required: true })
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: 'End date', required: true })
  endDate: Date;
}
