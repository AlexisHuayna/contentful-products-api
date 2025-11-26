import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ProductFilters {
    @ApiProperty({ description: 'Name of the product', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Category of the product', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ description: 'Page number', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number;

    @ApiProperty({ description: 'Limit number', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5)
    limit: number;
}
