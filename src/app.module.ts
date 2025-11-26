import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product';
import { ContentfulModule } from './contentful/contentful.module';
import { envValidationSchema } from './config/env.validation';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true, // Detiene la validación en el primer error
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DATABASE_LOGGING', false),
        entities: [Product],
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    ContentfulModule,
    AuthModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
