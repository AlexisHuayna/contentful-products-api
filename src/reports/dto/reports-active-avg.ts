import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from "class-validator";

export class ReportsActiveAvg {
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    withPrice: boolean;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    endDate: Date;
}