import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from './product.repository';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('ProductRepository', () => {
  let provider: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductRepository, {
        provide: getDataSourceToken,
        useValue: {
          createEntityManager: jest.fn(),
        },
      }],
    }).compile();

    provider = module.get<ProductRepository>(ProductRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
