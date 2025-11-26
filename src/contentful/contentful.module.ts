import { Module } from '@nestjs/common';
import { ContentfulService } from './services/contentful.service';

@Module({
  providers: [ContentfulService]
})
export class ContentfulModule {}
