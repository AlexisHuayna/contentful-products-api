import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductFilters } from '../dto/product-filters';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    async findPaginated(@Query() query: ProductFilters) {
        return this.productsService.findPaginated(query);
    }
}
