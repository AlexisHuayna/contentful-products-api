import { Controller, Delete, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductFilters } from '../dto/product-filters';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ProductResponseDto } from '../dto/product-response';
import { ApiProductMapper } from '../mappers/api-product.mapper';
import { DeleteResponseDto } from '../dto/product-delete';

@Controller({
    path: 'products',
    version: '1',
})
export class ProductsController {
    constructor(private readonly productsService: ProductsService, private readonly apiProductMapper: ApiProductMapper) {}

    @Get()
    async findPaginated(@Query() query: ProductFilters): Promise<PaginatedResponseDto<ProductResponseDto>>{
        const { data, page, pageSize, total, totalPages } = await this.productsService.findPaginated(query);
        return {
            data: data.map(this.apiProductMapper.mapEntityToResponseDto),
            page,
            pageSize,
            total,
            totalPages,
        };
    }

    @Delete(':id')
    async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<DeleteResponseDto> {
        await this.productsService.deleteById(id);
        return { id, deleted: true };
    }
}
