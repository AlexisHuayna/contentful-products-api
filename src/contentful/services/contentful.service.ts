import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ContentfulProductsResponse } from 'src/types/contentful-product.interface';

@Injectable()
export class ContentfulService {

    constructor(private readonly httpService: HttpService) {}

    async fetchProducts(): Promise<ContentfulProductsResponse> {
        const response = await firstValueFrom(
            this.httpService.get<ContentfulProductsResponse>('/entries')
        );
        return response?.data;
    }
}
