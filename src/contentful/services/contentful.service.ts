import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContentfulService {

    private readonly CONTENTFUL_SPACE_ID: string;
    private readonly CONTENTFUL_ACCESS_TOKEN: string;
    private readonly CONTENTFUL_ENVIRONMENT: string;
    private readonly CONTENTFUL_CONTENT_TYPE: string;

    constructor(private readonly configService: ConfigService) {
        this.CONTENTFUL_SPACE_ID = this.configService.getOrThrow<string>('CONTENTFUL_SPACE_ID');
        this.CONTENTFUL_ACCESS_TOKEN = this.configService.getOrThrow<string>('CONTENTFUL_ACCESS_TOKEN');
        this.CONTENTFUL_ENVIRONMENT = this.configService.getOrThrow<string>('CONTENTFUL_ENVIRONMENT');
        this.CONTENTFUL_CONTENT_TYPE = this.configService.getOrThrow<string>('CONTENTFUL_CONTENT_TYPE');
    }
}
