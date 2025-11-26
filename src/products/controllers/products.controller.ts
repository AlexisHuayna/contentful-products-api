import { Controller, Delete, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductFilters } from '../dto/product-filters';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { ProductResponseDto } from '../dto/product-response';
import { ApiProductMapper } from '../mappers/api-product.mapper';
import { DeleteResponseDto } from '../dto/product-delete';
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller({
    path: 'products',
    version: '1',
})
export class ProductsController {
    constructor(private readonly productsService: ProductsService, private readonly apiProductMapper: ApiProductMapper) {}

    @Get()
    @ApiOkResponse({ type: PaginatedResponseDto<ProductResponseDto>, description: 'Paginated products response' })
    @ApiQuery({ type: ProductFilters, name: 'query', description: 'Filters for products' })
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
    @ApiOkResponse({ type: DeleteResponseDto, description: 'Delete product response' })
    @ApiParam({ name: 'id', type: String, description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<DeleteResponseDto> {
        await this.productsService.deleteById(id);
        return { id, deleted: true };
    }
}
