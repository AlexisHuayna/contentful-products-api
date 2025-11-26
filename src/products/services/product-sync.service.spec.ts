import { Test, TestingModule } from '@nestjs/testing';
import { ProductSyncService } from './product-sync.service';
import { ProductsService } from './products.service';
import { ContentfulProductMapper } from '../mappers/contentful-product.mapper';
import { ContentfulService } from 'src/contentful/services/contentful.service';
import { ContentfulProductsResponse, ContentfulProductItem } from 'src/types/contentful-product.interface';
import { ProductUpsertDto } from '../dto/product-upsert';

describe('ProductSyncService', () => {
  let service: ProductSyncService;
  let productsService: jest.Mocked<ProductsService>;
  let contentfulProductMapper: jest.Mocked<ContentfulProductMapper>;
  let contentfulService: jest.Mocked<ContentfulService>;

  const mockContentfulProductItem: ContentfulProductItem = {
    metadata: { tags: [], concepts: [] },
    sys: {
      space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
      id: 'product-1',
      type: 'Entry',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      environment: { sys: { type: 'Link', linkType: 'Environment', id: 'env-id' } },
      publishedVersion: 1,
      revision: 1,
      contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'product' } },
      locale: 'en-US',
    },
    fields: {
      sku: 12345,
      name: 'Test Product',
      brand: 'Test Brand',
      model: 'Test Model',
      category: 'Test Category',
      color: 'Red',
      price: 99.99,
      currency: 'USD',
      stock: 10,
    },
  };

  const mockProductUpsertDto: ProductUpsertDto = {
    externalId: 'product-1',
    sku: 12345,
    name: 'Test Product',
    brand: 'Test Brand',
    model: 'Test Model',
    category: 'Test Category',
    color: 'Red',
    price: 99.99,
    currency: 'USD',
    stock: 10,
    contentCreatedAt: new Date('2024-01-01T00:00:00Z'),
    contentUpdatedAt: new Date('2024-01-02T00:00:00Z'),
  };

  const mockContentfulResponse: ContentfulProductsResponse = {
    total: 1,
    skip: 0,
    limit: 100,
    items: [mockContentfulProductItem],
  };

  beforeEach(async () => {
    const mockProductsService = {
      upsertFromContentful: jest.fn().mockResolvedValue(undefined),
    };

    const mockContentfulProductMapper = {
      mapEntriesToProductUpsertDtos: jest.fn().mockReturnValue([mockProductUpsertDto]),
    };

    const mockContentfulService = {
      fetchProducts: jest.fn().mockResolvedValue(mockContentfulResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSyncService,
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ContentfulProductMapper,
          useValue: mockContentfulProductMapper,
        },
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
      ],
    }).compile();

    service = module.get<ProductSyncService>(ProductSyncService);
    productsService = module.get(ProductsService);
    contentfulProductMapper = module.get(ContentfulProductMapper);
    contentfulService = module.get(ContentfulService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncProducts', () => {
    it('should successfully sync products from Contentful', async () => {
      await service.syncProducts();

      expect(contentfulService.fetchProducts).toHaveBeenCalledTimes(1);
      expect(contentfulProductMapper.mapEntriesToProductUpsertDtos).toHaveBeenCalledWith(
        mockContentfulResponse.items,
      );
      expect(productsService.upsertFromContentful).toHaveBeenCalledWith([mockProductUpsertDto]);
    });

    it('should call dependencies in the correct order', async () => {
      const callOrder: string[] = [];

      contentfulService.fetchProducts.mockImplementation(async () => {
        callOrder.push('fetchProducts');
        return mockContentfulResponse;
      });

      contentfulProductMapper.mapEntriesToProductUpsertDtos.mockImplementation((entries) => {
        callOrder.push('mapEntriesToProductUpsertDtos');
        return [mockProductUpsertDto];
      });

      productsService.upsertFromContentful.mockImplementation(async () => {
        callOrder.push('upsertFromContentful');
      });

      await service.syncProducts();

      expect(callOrder).toEqual([
        'fetchProducts',
        'mapEntriesToProductUpsertDtos',
        'upsertFromContentful',
      ]);
    });

    it('should handle empty product list', async () => {
      const emptyResponse: ContentfulProductsResponse = {
        total: 0,
        skip: 0,
        limit: 100,
        items: [],
      };

      contentfulService.fetchProducts.mockResolvedValue(emptyResponse);
      contentfulProductMapper.mapEntriesToProductUpsertDtos.mockReturnValue([]);

      await service.syncProducts();

      expect(contentfulService.fetchProducts).toHaveBeenCalledTimes(1);
      expect(contentfulProductMapper.mapEntriesToProductUpsertDtos).toHaveBeenCalledWith([]);
      expect(productsService.upsertFromContentful).toHaveBeenCalledWith([]);
    });

    it('should handle errors from ContentfulService gracefully', async () => {
      const error = new Error('Contentful API error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      contentfulService.fetchProducts.mockRejectedValue(error);

      await service.syncProducts();

      expect(contentfulService.fetchProducts).toHaveBeenCalledTimes(1);
      expect(contentfulProductMapper.mapEntriesToProductUpsertDtos).not.toHaveBeenCalled();
      expect(productsService.upsertFromContentful).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors from ContentfulProductMapper gracefully', async () => {
      const error = new Error('Mapping error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      contentfulProductMapper.mapEntriesToProductUpsertDtos.mockImplementation(() => {
        throw error;
      });

      await service.syncProducts();

      expect(contentfulService.fetchProducts).toHaveBeenCalledTimes(1);
      expect(contentfulProductMapper.mapEntriesToProductUpsertDtos).toHaveBeenCalled();
      expect(productsService.upsertFromContentful).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors from ProductsService gracefully', async () => {
      const error = new Error('Database error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      productsService.upsertFromContentful.mockRejectedValue(error);

      await service.syncProducts();

      expect(contentfulService.fetchProducts).toHaveBeenCalledTimes(1);
      expect(contentfulProductMapper.mapEntriesToProductUpsertDtos).toHaveBeenCalled();
      expect(productsService.upsertFromContentful).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);

      consoleErrorSpy.mockRestore();
    });

    it('should handle multiple products', async () => {
      const multipleProductsResponse: ContentfulProductsResponse = {
        total: 2,
        skip: 0,
        limit: 100,
        items: [
          mockContentfulProductItem,
          {
            ...mockContentfulProductItem,
            sys: { ...mockContentfulProductItem.sys, id: 'product-2' },
            fields: { ...mockContentfulProductItem.fields, name: 'Test Product 2' },
          },
        ],
      };

      const multipleDtos: ProductUpsertDto[] = [
        mockProductUpsertDto,
        { ...mockProductUpsertDto, externalId: 'product-2', name: 'Test Product 2' },
      ];

      contentfulService.fetchProducts.mockResolvedValue(multipleProductsResponse);
      contentfulProductMapper.mapEntriesToProductUpsertDtos.mockReturnValue(multipleDtos);

      await service.syncProducts();

      expect(contentfulService.fetchProducts).toHaveBeenCalledTimes(1);
      expect(contentfulProductMapper.mapEntriesToProductUpsertDtos).toHaveBeenCalledWith(
        multipleProductsResponse.items,
      );
      expect(productsService.upsertFromContentful).toHaveBeenCalledWith(multipleDtos);
    });
  });
});
