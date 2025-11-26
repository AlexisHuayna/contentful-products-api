import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from './product.repository';
import { DataSource } from 'typeorm';
import { Product } from '../entities/product';
import { ProductFilters } from '../dto/product-filters';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { UpdateResult } from 'typeorm';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: any;

  const mockFindAndCount = jest.fn();
  const mockFind = jest.fn();
  const mockFindOne = jest.fn();
  const mockUpdate = jest.fn();
  const mockCreateQueryBuilder = jest.fn();

  beforeEach(async () => {
    mockEntityManager = {
      connection: {},
    };

    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
    };

    dataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);

    // Mock Repository methods
    repository.findAndCount = mockFindAndCount;
    repository.find = mockFind;
    repository.findOne = mockFindOne;
    repository.update = mockUpdate;
    repository.createQueryBuilder = mockCreateQueryBuilder;

    // Setup QueryBuilder chain
    mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);
    Object.assign(repository, {
      findAndCount: mockFindAndCount,
      find: mockFind,
      findOne: mockFindOne,
      update: mockUpdate,
      createQueryBuilder: mockCreateQueryBuilder,
    });

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findPaginatedWithFilters', () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        externalId: 'ext-1',
        name: 'Product 1',
        category: 'Category 1',
        deleted: false,
      } as Product,
      {
        id: '2',
        externalId: 'ext-2',
        name: 'Product 2',
        category: 'Category 2',
        deleted: false,
      } as Product,
    ];

    it('should return paginated products with default page and limit', async () => {
      const filters: ProductFilters = {} as ProductFilters;
      const expectedResult: [Product[], number] = [mockProducts, 10];

      mockFindAndCount.mockResolvedValue(expectedResult);

      const result = await repository.findPaginatedWithFilters(filters);

      expect(mockFindAndCount).toHaveBeenCalledWith({
        where: { deleted: false },
        skip: 0,
        take: 5,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated products with custom page and limit', async () => {
      const filters: ProductFilters = {
        page: 2,
        limit: 3,
      } as ProductFilters;
      const expectedResult: [Product[], number] = [mockProducts, 10];

      mockFindAndCount.mockResolvedValue(expectedResult);

      const result = await repository.findPaginatedWithFilters(filters);

      expect(mockFindAndCount).toHaveBeenCalledWith({
        where: { deleted: false },
        skip: 3, // (2 - 1) * 3
        take: 3,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should filter by name when provided', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 5,
        name: 'test',
      } as ProductFilters;
      const expectedResult: [Product[], number] = [mockProducts, 2];

      mockFindAndCount.mockResolvedValue(expectedResult);

      const result = await repository.findPaginatedWithFilters(filters);

      expect(mockFindAndCount).toHaveBeenCalled();
      const callArgs = mockFindAndCount.mock.calls[0][0];
      expect(callArgs.where.deleted).toBe(false);
      expect(callArgs.where.name).toBeDefined();
      expect(callArgs.skip).toBe(0);
      expect(callArgs.take).toBe(5);
      expect(result).toEqual(expectedResult);
    });

    it('should filter by category when provided', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 5,
        category: 'electronics',
      } as ProductFilters;
      const expectedResult: [Product[], number] = [mockProducts, 2];

      mockFindAndCount.mockResolvedValue(expectedResult);

      const result = await repository.findPaginatedWithFilters(filters);

      expect(mockFindAndCount).toHaveBeenCalled();
      const callArgs = mockFindAndCount.mock.calls[0][0];
      expect(callArgs.where.deleted).toBe(false);
      expect(callArgs.where.category).toBeDefined();
      expect(callArgs.skip).toBe(0);
      expect(callArgs.take).toBe(5);
      expect(result).toEqual(expectedResult);
    });

    it('should filter by both name and category when provided', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 5,
        name: 'test',
        category: 'electronics',
      } as ProductFilters;
      const expectedResult: [Product[], number] = [mockProducts, 2];

      mockFindAndCount.mockResolvedValue(expectedResult);

      const result = await repository.findPaginatedWithFilters(filters);

      expect(mockFindAndCount).toHaveBeenCalled();
      const callArgs = mockFindAndCount.mock.calls[0][0];
      expect(callArgs.where.deleted).toBe(false);
      expect(callArgs.where.name).toBeDefined();
      expect(callArgs.where.category).toBeDefined();
      expect(callArgs.skip).toBe(0);
      expect(callArgs.take).toBe(5);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when page is less than 1', async () => {
      const filters: ProductFilters = {
        page: 0,
        limit: 5,
      } as ProductFilters;

      await expect(
        repository.findPaginatedWithFilters(filters),
      ).rejects.toThrow(BadRequestException);
      await expect(
        repository.findPaginatedWithFilters(filters),
      ).rejects.toThrow('Page number must be greater than 0');
      expect(mockFindAndCount).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when limit is less than 1', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 0,
      } as ProductFilters;

      await expect(
        repository.findPaginatedWithFilters(filters),
      ).rejects.toThrow(BadRequestException);
      await expect(
        repository.findPaginatedWithFilters(filters),
      ).rejects.toThrow('Limit must be between 1 and 5');
      expect(mockFindAndCount).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when limit is greater than MAX_PAGE_LIMIT', async () => {
      const filters: ProductFilters = {
        page: 1,
        limit: 6,
      } as ProductFilters;

      await expect(
        repository.findPaginatedWithFilters(filters),
      ).rejects.toThrow(BadRequestException);
      await expect(
        repository.findPaginatedWithFilters(filters),
      ).rejects.toThrow('Limit must be between 1 and 5');
      expect(mockFindAndCount).not.toHaveBeenCalled();
    });

    it('should calculate skip correctly for page 3 with limit 2', async () => {
      const filters: ProductFilters = {
        page: 3,
        limit: 2,
      } as ProductFilters;
      const expectedResult: [Product[], number] = [mockProducts, 10];

      mockFindAndCount.mockResolvedValue(expectedResult);

      await repository.findPaginatedWithFilters(filters);

      expect(mockFindAndCount).toHaveBeenCalledWith({
        where: { deleted: false },
        skip: 4, // (3 - 1) * 2
        take: 2,
      });
    });
  });

  describe('findByExternalIds', () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        externalId: 'ext-1',
        name: 'Product 1',
        deleted: false,
      } as Product,
      {
        id: '2',
        externalId: 'ext-2',
        name: 'Product 2',
        deleted: true,
      } as Product,
    ];

    it('should find products by external IDs including deleted ones', async () => {
      const externalIds = ['ext-1', 'ext-2'];
      mockFind.mockResolvedValue(mockProducts);

      const result = await repository.findByExternalIds(externalIds);

      expect(mockFind).toHaveBeenCalled();
      const callArgs = mockFind.mock.calls[0][0];
      expect(callArgs.where.externalId).toBeDefined();
      expect(callArgs.withDeleted).toBe(true);
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products found', async () => {
      const externalIds = ['ext-999'];
      mockFind.mockResolvedValue([]);

      const result = await repository.findByExternalIds(externalIds);

      expect(mockFind).toHaveBeenCalled();
      const callArgs = mockFind.mock.calls[0][0];
      expect(callArgs.where.externalId).toBeDefined();
      expect(callArgs.withDeleted).toBe(true);
      expect(result).toEqual([]);
    });

    it('should handle empty array of external IDs', async () => {
      mockFind.mockResolvedValue([]);

      const result = await repository.findByExternalIds([]);

      expect(mockFind).toHaveBeenCalled();
      const callArgs = mockFind.mock.calls[0][0];
      expect(callArgs.where.externalId).toBeDefined();
      expect(callArgs.withDeleted).toBe(true);
      expect(result).toEqual([]);
    });
  });

  describe('softDeleteById', () => {
    const mockProduct: Product = {
      id: 'uuid-123',
      externalId: 'ext-1',
      name: 'Product 1',
      deleted: false,
    } as Product;

    const mockUpdateResult: UpdateResult = {
      affected: 1,
      raw: [],
      generatedMaps: [],
    };

    it('should soft delete product when found', async () => {
      mockFindOne.mockResolvedValue(mockProduct);
      mockUpdate.mockResolvedValue(mockUpdateResult);

      const result = await repository.softDeleteById('uuid-123');

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(mockUpdate).toHaveBeenCalledWith('uuid-123', {
        deleted: true,
        deletedAt: expect.any(Date),
      });
      expect(result).toEqual(mockUpdateResult);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(
        repository.softDeleteById('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        repository.softDeleteById('non-existent-id'),
      ).rejects.toThrow('Product with ID non-existent-id not found');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should set deletedAt to current date when soft deleting', async () => {
      const beforeDate = new Date();
      mockFindOne.mockResolvedValue(mockProduct);
      mockUpdate.mockResolvedValue(mockUpdateResult);

      await repository.softDeleteById('uuid-123');
      const afterDate = new Date();

      expect(mockUpdate).toHaveBeenCalledWith('uuid-123', {
        deleted: true,
        deletedAt: expect.any(Date),
      });

      const callArgs = mockUpdate.mock.calls[0];
      const deletedAt = callArgs[1].deletedAt as Date;
      expect(deletedAt.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(deletedAt.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });
  });

  describe('getAveragePrice', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };
      mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return average price for valid date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockResult = { avg: '99.50' };

      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      const result = await repository.getAveragePrice(startDate, endDate);

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'AVG(product.price)',
        'avg',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.deleted = :deleted',
        { deleted: false },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.contentCreatedAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      expect(result).toBe(99.5);
    });

    it('should return null when no results found', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      const result = await repository.getAveragePrice(startDate, endDate);

      expect(result).toBeNull();
    });

    it('should return null when avg is null', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: null });

      const result = await repository.getAveragePrice(startDate, endDate);

      expect(result).toBeNull();
    });

    it('should parse string average to float', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockResult = { avg: '123.456' };

      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      const result = await repository.getAveragePrice(startDate, endDate);

      expect(result).toBe(123.456);
    });

    it('should exclude deleted products', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockResult = { avg: '50.00' };

      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      await repository.getAveragePrice(startDate, endDate);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.deleted = :deleted',
        { deleted: false },
      );
    });
  });

  describe('getAveragePriceByCategories', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };
      mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return average price grouped by category', async () => {
      const mockResult = [
        { category: 'Electronics', avg: '199.99' },
        { category: 'Clothing', avg: '49.99' },
        { category: 'Books', avg: '19.99' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockResult);

      const result = await repository.getAveragePriceByCategories();

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'product.category',
        'category',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'AVG(product.price)',
        'avg',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.deleted = :deleted',
        { deleted: false },
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('product.category');
      expect(result).toEqual(mockResult);
    });

    it('should return empty array when no categories found', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await repository.getAveragePriceByCategories();

      expect(result).toEqual([]);
    });

    it('should exclude deleted products', async () => {
      const mockResult = [{ category: 'Electronics', avg: '199.99' }];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockResult);

      await repository.getAveragePriceByCategories();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.deleted = :deleted',
        { deleted: false },
      );
    });

    it('should group by category correctly', async () => {
      const mockResult = [
        { category: 'Category1', avg: '100.00' },
        { category: 'Category2', avg: '200.00' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockResult);

      const result = await repository.getAveragePriceByCategories();

      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('product.category');
      expect(result).toEqual(mockResult);
    });
  });
});
