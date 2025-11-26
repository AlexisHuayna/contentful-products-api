import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { ApiProductMapper } from '../mappers/api-product.mapper';
import { ProductFilters } from '../dto/product-filters';
import { Product } from '../entities/product';
import { ProductResponseDto } from '../dto/product-response';
import { UpdateResult } from 'typeorm';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: jest.Mocked<ProductsService>;
  let apiProductMapper: jest.Mocked<ApiProductMapper>;

  const mockProductsService = {
    findPaginated: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockApiProductMapper = {
    mapEntityToResponseDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ApiProductMapper,
          useValue: mockApiProductMapper,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get(ProductsService);
    apiProductMapper = module.get(ApiProductMapper);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findPaginated', () => {
    it('should call service with filters and return paginated response', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 5,
      } as ProductFilters;

      const mockProducts: Product[] = [
        {
          id: 'uuid-1',
          externalId: 'ext-1',
          name: 'Product 1',
          sku: 123,
          brand: 'Brand 1',
          model: 'Model 1',
          category: 'Category 1',
          color: 'Red',
          price: 99.99,
          currency: 'USD',
          stock: 10,
        } as Product,
        {
          id: 'uuid-2',
          externalId: 'ext-2',
          name: 'Product 2',
          sku: 456,
          brand: 'Brand 2',
          model: null,
          category: 'Category 2',
          color: null,
          price: 199.99,
          currency: 'EUR',
          stock: 5,
        } as Product,
      ];

      const mockResponseDtos: ProductResponseDto[] = [
        {
          id: 'uuid-1',
          sku: 123,
          name: 'Product 1',
          brand: 'Brand 1',
          model: 'Model 1',
          category: 'Category 1',
          color: 'Red',
          price: 99.99,
          currency: 'USD',
          stock: 10,
        },
        {
          id: 'uuid-2',
          sku: 456,
          name: 'Product 2',
          brand: 'Brand 2',
          model: null,
          category: 'Category 2',
          color: null,
          price: 199.99,
          currency: 'EUR',
          stock: 5,
        },
      ];

      productsService.findPaginated.mockResolvedValue({
        data: mockProducts,
        page: 1,
        pageSize: 5,
        total: 10,
        totalPages: 2,
      });

      mockApiProductMapper.mapEntityToResponseDto.mockImplementation(
        (product: Product) => {
          if (product.id === 'uuid-1') {
            return mockResponseDtos[0];
          }
          return mockResponseDtos[1];
        },
      );

      const result = await controller.findPaginated(filters);

      expect(productsService.findPaginated).toHaveBeenCalledWith(filters);
      expect(productsService.findPaginated).toHaveBeenCalledTimes(1);
      expect(apiProductMapper.mapEntityToResponseDto).toHaveBeenCalledTimes(2);
      // map() passes (element, index, array) to the callback, so we check the first argument
      expect(apiProductMapper.mapEntityToResponseDto).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ id: 'uuid-1' }),
        expect.anything(),
        expect.anything(),
      );
      expect(apiProductMapper.mapEntityToResponseDto).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ id: 'uuid-2' }),
        expect.anything(),
        expect.anything(),
      );
      expect(result).toEqual({
        data: mockResponseDtos,
        page: 1,
        pageSize: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('should handle empty results', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 5,
      } as ProductFilters;

      productsService.findPaginated.mockResolvedValue({
        data: [],
        page: 1,
        pageSize: 5,
        total: 0,
        totalPages: 0,
      });

      const result = await controller.findPaginated(filters);

      expect(productsService.findPaginated).toHaveBeenCalledWith(filters);
      expect(apiProductMapper.mapEntityToResponseDto).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: [],
        page: 1,
        pageSize: 5,
        total: 0,
        totalPages: 0,
      });
    });

    it('should handle filters with name and category', async () => {
      const filters: ProductFilters = {
        name: 'Test Product',
        category: 'Electronics',
        page: 2,
        limit: 3,
      } as ProductFilters;

      const mockProducts: Product[] = [
        {
          id: 'uuid-1',
          externalId: 'ext-1',
          name: 'Test Product',
          category: 'Electronics',
        } as Product,
      ];

      const mockResponseDto: ProductResponseDto = {
        id: 'uuid-1',
        sku: null,
        name: 'Test Product',
        brand: null,
        model: null,
        category: 'Electronics',
        color: null,
        price: null,
        currency: null,
        stock: null,
      };

      productsService.findPaginated.mockResolvedValue({
        data: mockProducts,
        page: 2,
        pageSize: 3,
        total: 5,
        totalPages: 2,
      });

      mockApiProductMapper.mapEntityToResponseDto.mockReturnValue(
        mockResponseDto,
      );

      const result = await controller.findPaginated(filters);

      expect(productsService.findPaginated).toHaveBeenCalledWith(filters);
      expect(result).toEqual({
        data: [mockResponseDto],
        page: 2,
        pageSize: 3,
        total: 5,
        totalPages: 2,
      });
    });
  });

  describe('deleteById', () => {
    it('should call service with id and return delete response', async () => {
      const id = 'uuid-123';
      const mockUpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      } as UpdateResult;
      productsService.deleteById.mockResolvedValue(mockUpdateResult);

      const result = await controller.deleteById(id);

      expect(productsService.deleteById).toHaveBeenCalledWith(id);
      expect(productsService.deleteById).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: 'uuid-123',
        deleted: true,
      });
    });

    it('should handle different uuid formats', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const mockUpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      } as UpdateResult;
      productsService.deleteById.mockResolvedValue(mockUpdateResult);

      const result = await controller.deleteById(id);

      expect(productsService.deleteById).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        deleted: true,
      });
    });
  });
});
