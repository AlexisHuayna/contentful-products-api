import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductFilters {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    category: string;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    page: number;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    limit: number;
}
