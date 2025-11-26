import { Module } from '@nestjs/common';
import { ContentfulService } from './services/contentful.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: `https://cdn.contentful.com/spaces/${configService.get<string>('CONTENTFUL_SPACE_ID')}/environments/${configService.get<string>('CONTENTFUL_ENVIRONMENT')}`,
        headers: {
          'Authorization': `Bearer ${configService.get<string>('CONTENTFUL_ACCESS_TOKEN')}`,
        },
        params: {
          content_type: configService.get<string>('CONTENTFUL_CONTENT_TYPE'),
        },
        timeout: 5000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ContentfulService],
  exports: [ContentfulService],
})
export class ContentfulModule {}
