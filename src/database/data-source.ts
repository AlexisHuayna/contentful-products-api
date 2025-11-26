// src/database/data-source.ts
import 'reflect-metadata';
import { Product } from '../products/entities/product';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({
    path: resolve(process.cwd(), '.env'),
});

const isProduction = __dirname.includes('dist') || process.env.NODE_ENV === 'production';
const migrationExtension = isProduction ? 'js' : 'ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'products_db',
  entities: [Product],
  migrations: [__dirname + '/migrations/*.' + migrationExtension],
  synchronize: false,
});
