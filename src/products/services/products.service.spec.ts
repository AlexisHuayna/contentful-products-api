import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductFilters } from '../dto/product-filters';
import { ProductUpsertDto } from '../dto/product-upsert';
import { Product } from '../entities/product';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockProductRepository = {
    findPaginatedWithFilters: jest.fn(),
    findByExternalIds: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDeleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(ProductRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPaginated', () => {
    it('should call repository with DTO when default page and limit are not provided', async () => {
      const filters: ProductFilters = {} as ProductFilters;
      const mockResult: [Product[], number] = [[], 0];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(mockProductRepository.findPaginatedWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toEqual({
        data: [],
        page: 1,
        pageSize: 5,
        total: 0,
        totalPages: 0,
      });
    });

    it('should call repository with DTO when page and limit are provided', async () => {
      const filters: ProductFilters = {
        page: 2,
        limit: 3,
      } as ProductFilters;
      const mockResult: [Product[], number] = [[], 0];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(mockProductRepository.findPaginatedWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(3);
    });

    it('should return formatted result from repository', async () => {
      const filters: ProductFilters = { page: 1, limit: 5 } as ProductFilters;
      const mockProducts: Product[] = [
        {
          id: '1',
          externalId: 'ext-1',
          name: 'Product 1',
        } as Product,
      ];
      const mockResult: [Product[], number] = [mockProducts, 10];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(result).toEqual({
        data: mockProducts,
        page: 1,
        pageSize: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('should calculate totalPages correctly when total is exactly divisible by limit', async () => {
      const filters: ProductFilters = { page: 1, limit: 5 } as ProductFilters;
      const mockResult: [Product[], number] = [[], 25];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(result.totalPages).toBe(5); // 25 / 5 = 5
    });

    it('should calculate totalPages correctly when total is not divisible by limit', async () => {
      const filters: ProductFilters = { page: 1, limit: 5 } as ProductFilters;
      const mockResult: [Product[], number] = [[], 23];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(result.totalPages).toBe(5); // Math.ceil(23 / 5) = 5
    });

    it('should return totalPages as 0 when total is 0', async () => {
      const filters: ProductFilters = { page: 1, limit: 5 } as ProductFilters;
      const mockResult: [Product[], number] = [[], 0];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(result.totalPages).toBe(0);
    });

    it('should use default page and limit when not provided', async () => {
      const filters: ProductFilters = {} as ProductFilters;
      const mockResult: [Product[], number] = [[], 0];

      mockProductRepository.findPaginatedWithFilters.mockResolvedValue(mockResult);

      const result = await service.findPaginated(filters);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(5);
    });
  });

  describe('deleteById', () => {
    it('should call repository softDeleteById with the provided id', async () => {
      const id = 'uuid-123';
      const mockUpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };

      mockProductRepository.softDeleteById.mockResolvedValue(mockUpdateResult);

      const result = await service.deleteById(id);

      expect(mockProductRepository.softDeleteById).toHaveBeenCalledWith(id);
      expect(mockProductRepository.softDeleteById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdateResult);
    });

    it('should return the result from repository', async () => {
      const id = 'uuid-456';
      const mockUpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };

      mockProductRepository.softDeleteById.mockResolvedValue(mockUpdateResult);

      const result = await service.deleteById(id);

      expect(result).toBe(mockUpdateResult);
    });

    it('should propagate errors from repository', async () => {
      const id = 'invalid-uuid';
      const error = new Error('Repository error');

      mockProductRepository.softDeleteById.mockRejectedValue(error);

      await expect(service.deleteById(id)).rejects.toThrow('Repository error');
      expect(mockProductRepository.softDeleteById).toHaveBeenCalledWith(id);
    });
  });

  describe('upsertFromContentful', () => {
    it('should return early if data array is empty', async () => {
      await service.upsertFromContentful([]);

      expect(mockProductRepository.findByExternalIds).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should create new products when none exist', async () => {
      const dtos: ProductUpsertDto[] = [
        {
          externalId: 'ext-1',
          sku: 123,
          name: 'New Product',
          brand: 'Brand',
          model: 'Model',
          category: 'Category',
          color: 'Red',
          price: 99.99,
          currency: 'USD',
          stock: 10,
          contentCreatedAt: new Date('2024-01-01'),
          contentUpdatedAt: new Date('2024-01-02'),
        },
      ];

      mockProductRepository.findByExternalIds.mockResolvedValue([]);
      const mockCreatedProduct = new Product();
      mockProductRepository.create.mockReturnValue(mockCreatedProduct);
      mockProductRepository.save.mockResolvedValue([mockCreatedProduct]);

      await service.upsertFromContentful(dtos);

      expect(mockProductRepository.findByExternalIds).toHaveBeenCalledWith(['ext-1']);
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        [mockCreatedProduct],
        { chunk: 100 },
      );
      expect(mockCreatedProduct.externalId).toBe('ext-1');
      expect(mockCreatedProduct.name).toBe('New Product');
    });

    it('should update existing non-deleted products', async () => {
      const dtos: ProductUpsertDto[] = [
        {
          externalId: 'ext-1',
          sku: 456,
          name: 'Updated Product',
          brand: 'New Brand',
          model: null,
          category: null,
          color: null,
          price: 199.99,
          currency: 'EUR',
          stock: 5,
          contentCreatedAt: null,
          contentUpdatedAt: new Date('2024-01-03'),
        },
      ];

      const existingProduct = {
        id: 'uuid-1',
        externalId: 'ext-1',
        sku: 123,
        name: 'Old Product',
        brand: 'Old Brand',
        deleted: false,
      } as Product;

      mockProductRepository.findByExternalIds.mockResolvedValue([existingProduct]);
      mockProductRepository.save.mockResolvedValue([existingProduct]);

      await service.upsertFromContentful(dtos);

      expect(existingProduct.sku).toBe(456);
      expect(existingProduct.name).toBe('Updated Product');
      expect(existingProduct.brand).toBe('New Brand');
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        [existingProduct],
        { chunk: 100 },
      );
    });

    it('should skip existing deleted products', async () => {
      const dtos: ProductUpsertDto[] = [
        {
          externalId: 'ext-1',
          sku: 789,
          name: 'Deleted Product',
          brand: null,
          model: null,
          category: null,
          color: null,
          price: null,
          currency: null,
          stock: null,
          contentCreatedAt: null,
          contentUpdatedAt: new Date('2024-01-04'),
        },
      ];

      const deletedProduct = {
        id: 'uuid-1',
        externalId: 'ext-1',
        name: 'Deleted Product',
        deleted: true,
      } as Product;

      mockProductRepository.findByExternalIds.mockResolvedValue([deletedProduct]);
      mockProductRepository.save.mockResolvedValue([]);

      await service.upsertFromContentful(dtos);

      expect(mockProductRepository.create).not.toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalledWith([], { chunk: 100 });
    });

    it('should handle mixed scenario with new, updated, and skipped products', async () => {
      const dtos: ProductUpsertDto[] = [
        {
          externalId: 'ext-1',
          sku: 100,
          name: 'New Product',
          brand: null,
          model: null,
          category: null,
          color: null,
          price: null,
          currency: null,
          stock: null,
          contentCreatedAt: null,
          contentUpdatedAt: new Date('2024-01-01'),
        },
        {
          externalId: 'ext-2',
          sku: 200,
          name: 'Updated Product',
          brand: null,
          model: null,
          category: null,
          color: null,
          price: null,
          currency: null,
          stock: null,
          contentCreatedAt: null,
          contentUpdatedAt: new Date('2024-01-02'),
        },
        {
          externalId: 'ext-3',
          sku: 300,
          name: 'Deleted Product',
          brand: null,
          model: null,
          category: null,
          color: null,
          price: null,
          currency: null,
          stock: null,
          contentCreatedAt: null,
          contentUpdatedAt: new Date('2024-01-03'),
        },
      ];

      const existingProduct = {
        id: 'uuid-2',
        externalId: 'ext-2',
        name: 'Old Product',
        deleted: false,
      } as Product;

      const deletedProduct = {
        id: 'uuid-3',
        externalId: 'ext-3',
        name: 'Deleted Product',
        deleted: true,
      } as Product;

      mockProductRepository.findByExternalIds.mockResolvedValue([
        existingProduct,
        deletedProduct,
      ]);
      const mockNewProduct = new Product();
      mockProductRepository.create.mockReturnValue(mockNewProduct);
      mockProductRepository.save.mockResolvedValue([mockNewProduct, existingProduct]);

      await service.upsertFromContentful(dtos);

      expect(mockProductRepository.findByExternalIds).toHaveBeenCalledWith([
        'ext-1',
        'ext-2',
        'ext-3',
      ]);
      expect(mockProductRepository.create).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([mockNewProduct, existingProduct]),
        { chunk: 100 },
      );
      expect(existingProduct.name).toBe('Updated Product');
    });

    it('should handle null values correctly when mapping to new entity', async () => {
      const dtos: ProductUpsertDto[] = [
        {
          externalId: 'ext-1',
          sku: null,
          name: 'Product',
          brand: null,
          model: null,
          category: null,
          color: null,
          price: null,
          currency: null,
          stock: null,
          contentCreatedAt: null,
          contentUpdatedAt: new Date('2024-01-01'),
        },
      ];

      mockProductRepository.findByExternalIds.mockResolvedValue([]);
      const mockCreatedProduct = new Product();
      mockProductRepository.create.mockReturnValue(mockCreatedProduct);
      mockProductRepository.save.mockResolvedValue([mockCreatedProduct]);

      await service.upsertFromContentful(dtos);

      expect(mockCreatedProduct.externalId).toBe('ext-1');
      expect(mockCreatedProduct.sku).toBeNull();
      expect(mockCreatedProduct.name).toBe('Product');
      expect(mockCreatedProduct.brand).toBeNull();
      expect(mockCreatedProduct.contentCreatedAt).toBeNull();
      expect(mockCreatedProduct.contentUpdatedAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('mapDtoToNewEntity', () => {
    it('should map all fields from DTO to new entity', () => {
      const dto: ProductUpsertDto = {
        externalId: 'ext-1',
        sku: 123,
        name: 'Test Product',
        brand: 'Test Brand',
        model: 'Test Model',
        category: 'Test Category',
        color: 'Blue',
        price: 99.99,
        currency: 'USD',
        stock: 10,
        contentCreatedAt: new Date('2024-01-01'),
        contentUpdatedAt: new Date('2024-01-02'),
      };

      const product = new Product();
      service.mapDtoToNewEntity(dto, product);

      expect(product.externalId).toBe('ext-1');
      expect(product.sku).toBe(123);
      expect(product.name).toBe('Test Product');
      expect(product.brand).toBe('Test Brand');
      expect(product.model).toBe('Test Model');
      expect(product.category).toBe('Test Category');
      expect(product.color).toBe('Blue');
      expect(product.price).toBe(99.99);
      expect(product.currency).toBe('USD');
      expect(product.stock).toBe(10);
      expect(product.contentCreatedAt).toEqual(new Date('2024-01-01'));
      expect(product.contentUpdatedAt).toEqual(new Date('2024-01-02'));
    });

    it('should handle null values correctly', () => {
      const dto: ProductUpsertDto = {
        externalId: 'ext-1',
        sku: null,
        name: 'Test Product',
        brand: null,
        model: null,
        category: null,
        color: null,
        price: null,
        currency: null,
        stock: null,
        contentCreatedAt: null,
        contentUpdatedAt: new Date('2024-01-02'),
      };

      const product = new Product();
      service.mapDtoToNewEntity(dto, product);

      expect(product.externalId).toBe('ext-1');
      expect(product.name).toBe('Test Product');
      expect(product.sku).toBeNull();
      expect(product.brand).toBeNull();
      expect(product.model).toBeNull();
      expect(product.category).toBeNull();
      expect(product.color).toBeNull();
      expect(product.price).toBeNull();
      expect(product.currency).toBeNull();
      expect(product.stock).toBeNull();
      expect(product.contentCreatedAt).toBeNull();
      expect(product.contentUpdatedAt).toEqual(new Date('2024-01-02'));
    });
  });

  describe('mapDtoToExistingEntity', () => {
    it('should update all fields except externalId from DTO to existing entity', () => {
      const dto: ProductUpsertDto = {
        externalId: 'ext-1',
        sku: 456,
        name: 'Updated Product',
        brand: 'Updated Brand',
        model: 'Updated Model',
        category: 'Updated Category',
        color: 'Red',
        price: 199.99,
        currency: 'EUR',
        stock: 20,
        contentCreatedAt: new Date('2024-01-01'),
        contentUpdatedAt: new Date('2024-01-02'),
      };

      const existingProduct = {
        id: 'uuid-1',
        externalId: 'ext-1',
        sku: 123,
        name: 'Old Product',
        brand: 'Old Brand',
        model: 'Old Model',
        category: 'Old Category',
        color: 'Blue',
        price: 99.99,
        currency: 'USD',
        stock: 10,
      } as Product;

      service.mapDtoToExistingEntity(dto, existingProduct);

      expect(existingProduct.externalId).toBe('ext-1'); // Should remain unchanged
      expect(existingProduct.sku).toBe(456);
      expect(existingProduct.name).toBe('Updated Product');
      expect(existingProduct.brand).toBe('Updated Brand');
      expect(existingProduct.model).toBe('Updated Model');
      expect(existingProduct.category).toBe('Updated Category');
      expect(existingProduct.color).toBe('Red');
      expect(existingProduct.price).toBe(199.99);
      expect(existingProduct.currency).toBe('EUR');
      expect(existingProduct.stock).toBe(20);
    });

    it('should handle null values correctly', () => {
      const dto: ProductUpsertDto = {
        externalId: 'ext-1',
        sku: null,
        name: 'Updated Product',
        brand: null,
        model: null,
        category: null,
        color: null,
        price: null,
        currency: null,
        stock: null,
        contentCreatedAt: null,
        contentUpdatedAt: new Date('2024-01-02'),
      };

      const existingProduct = {
        id: 'uuid-1',
        externalId: 'ext-1',
        sku: 123,
        name: 'Old Product',
        brand: 'Old Brand',
      } as Product;

      service.mapDtoToExistingEntity(dto, existingProduct);

      expect(existingProduct.sku).toBeNull();
      expect(existingProduct.name).toBe('Updated Product');
      expect(existingProduct.brand).toBeNull();
      expect(existingProduct.model).toBeNull();
      expect(existingProduct.category).toBeNull();
      expect(existingProduct.color).toBeNull();
      expect(existingProduct.price).toBeNull();
      expect(existingProduct.currency).toBeNull();
      expect(existingProduct.stock).toBeNull();
    });
  });
});
