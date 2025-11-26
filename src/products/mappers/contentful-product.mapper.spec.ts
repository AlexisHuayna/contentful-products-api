import { Test, TestingModule } from '@nestjs/testing';
import { ContentfulProductMapper } from './contentful-product.mapper';
import { ContentfulProductItem } from 'src/types/contentful-product.interface';

describe('ContentfulProductMapper', () => {
  let mapper: ContentfulProductMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentfulProductMapper],
    }).compile();

    mapper = module.get<ContentfulProductMapper>(ContentfulProductMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('mapEntryToProductUpsertDto', () => {
    it('should map a complete ContentfulProductItem to ProductUpsertDto', () => {
      const entry: ContentfulProductItem = {
        metadata: { tags: [], concepts: [] },
        sys: {
          space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
          id: 'product-123',
          type: 'Entry',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          environment: {
            sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
          },
          publishedVersion: 1,
          revision: 1,
          contentType: {
            sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
          },
          locale: 'en-US',
        },
        fields: {
          sku: 12345,
          name: 'Test Product',
          brand: 'Test Brand',
          model: 'Test Model',
          category: 'Electronics',
          color: 'Black',
          price: 99.99,
          currency: 'USD',
          stock: 50,
        },
      };

      const result = mapper.mapEntryToProductUpsertDto(entry);

      expect(result).toEqual({
        externalId: 'product-123',
        sku: 12345,
        name: 'Test Product',
        brand: 'Test Brand',
        model: 'Test Model',
        category: 'Electronics',
        color: 'Black',
        price: 99.99,
        currency: 'USD',
        stock: 50,
        contentCreatedAt: new Date('2024-01-15T10:00:00Z'),
        contentUpdatedAt: new Date('2024-01-20T15:30:00Z'),
      });
    });

    it('should map entry with null/undefined fields to null values', () => {
      const entry: ContentfulProductItem = {
        metadata: { tags: [], concepts: [] },
        sys: {
          space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
          id: 'product-456',
          type: 'Entry',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          environment: {
            sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
          },
          publishedVersion: 1,
          revision: 1,
          contentType: {
            sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
          },
          locale: 'en-US',
        },
        fields: {
          sku: null as any,
          name: '',
          brand: null as any,
          model: null as any,
          category: null as any,
          color: null as any,
          price: null as any,
          currency: null as any,
          stock: null as any,
        },
      };

      const result = mapper.mapEntryToProductUpsertDto(entry);

      expect(result).toEqual({
        externalId: 'product-456',
        sku: null,
        name: '',
        brand: null,
        model: null,
        category: null,
        color: null,
        price: null,
        currency: null,
        stock: null,
        contentCreatedAt: new Date('2024-01-15T10:00:00Z'),
        contentUpdatedAt: new Date('2024-01-20T15:30:00Z'),
      });
    });

    it('should handle missing fields object', () => {
      const entry = {
        metadata: { tags: [], concepts: [] },
        sys: {
          space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
          id: 'product-789',
          type: 'Entry',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          environment: {
            sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
          },
          publishedVersion: 1,
          revision: 1,
          contentType: {
            sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
          },
          locale: 'en-US',
        },
        fields: undefined as any,
      } as ContentfulProductItem;

      const result = mapper.mapEntryToProductUpsertDto(entry);

      expect(result).toEqual({
        externalId: 'product-789',
        sku: null,
        name: '',
        brand: null,
        model: null,
        category: null,
        color: null,
        price: null,
        currency: null,
        stock: null,
        contentCreatedAt: new Date('2024-01-15T10:00:00Z'),
        contentUpdatedAt: new Date('2024-01-20T15:30:00Z'),
      });
    });

    it('should handle missing createdAt and updatedAt in sys', () => {
      const entry: ContentfulProductItem = {
        metadata: { tags: [], concepts: [] },
        sys: {
          space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
          id: 'product-999',
          type: 'Entry',
          createdAt: undefined as any,
          updatedAt: undefined as any,
          environment: {
            sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
          },
          publishedVersion: 1,
          revision: 1,
          contentType: {
            sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
          },
          locale: 'en-US',
        },
        fields: {
          sku: 99999,
          name: 'Product Without Dates',
          brand: 'Brand',
          model: 'Model',
          category: 'Category',
          color: 'Red',
          price: 199.99,
          currency: 'EUR',
          stock: 100,
        },
      };

      const result = mapper.mapEntryToProductUpsertDto(entry);

      expect(result).toEqual({
        externalId: 'product-999',
        sku: 99999,
        name: 'Product Without Dates',
        brand: 'Brand',
        model: 'Model',
        category: 'Category',
        color: 'Red',
        price: 199.99,
        currency: 'EUR',
        stock: 100,
        contentCreatedAt: null,
        contentUpdatedAt: null,
      });
    });

    it('should throw an error when sys object is missing', () => {
      const entry = {
        metadata: { tags: [], concepts: [] },
        sys: undefined as any,
        fields: {
          sku: 11111,
          name: 'Product Without Sys',
          brand: 'Brand',
          model: 'Model',
          category: 'Category',
          color: 'Blue',
          price: 299.99,
          currency: 'GBP',
          stock: 200,
        },
      } as any;

      expect(() => mapper.mapEntryToProductUpsertDto(entry)).toThrow();
    });
  });

  describe('mapEntriesToProductUpsertDtos', () => {
    it('should map an array of entries to an array of DTOs', () => {
      const entries: ContentfulProductItem[] = [
        {
          metadata: { tags: [], concepts: [] },
          sys: {
            space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
            id: 'product-1',
            type: 'Entry',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z',
            environment: {
              sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
            },
            publishedVersion: 1,
            revision: 1,
            contentType: {
              sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
            },
            locale: 'en-US',
          },
          fields: {
            sku: 100,
            name: 'Product 1',
            brand: 'Brand 1',
            model: 'Model 1',
            category: 'Category 1',
            color: 'Red',
            price: 10.99,
            currency: 'USD',
            stock: 10,
          },
        },
        {
          metadata: { tags: [], concepts: [] },
          sys: {
            space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
            id: 'product-2',
            type: 'Entry',
            createdAt: '2024-01-16T10:00:00Z',
            updatedAt: '2024-01-21T15:30:00Z',
            environment: {
              sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
            },
            publishedVersion: 1,
            revision: 1,
            contentType: {
              sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
            },
            locale: 'en-US',
          },
          fields: {
            sku: 200,
            name: 'Product 2',
            brand: 'Brand 2',
            model: 'Model 2',
            category: 'Category 2',
            color: 'Blue',
            price: 20.99,
            currency: 'EUR',
            stock: 20,
          },
        },
      ];

      const result = mapper.mapEntriesToProductUpsertDtos(entries);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        externalId: 'product-1',
        sku: 100,
        name: 'Product 1',
        brand: 'Brand 1',
        model: 'Model 1',
        category: 'Category 1',
        color: 'Red',
        price: 10.99,
        currency: 'USD',
        stock: 10,
        contentCreatedAt: new Date('2024-01-15T10:00:00Z'),
        contentUpdatedAt: new Date('2024-01-20T15:30:00Z'),
      });
      expect(result[1]).toEqual({
        externalId: 'product-2',
        sku: 200,
        name: 'Product 2',
        brand: 'Brand 2',
        model: 'Model 2',
        category: 'Category 2',
        color: 'Blue',
        price: 20.99,
        currency: 'EUR',
        stock: 20,
        contentCreatedAt: new Date('2024-01-16T10:00:00Z'),
        contentUpdatedAt: new Date('2024-01-21T15:30:00Z'),
      });
    });

    it('should return an empty array when given an empty array', () => {
      const entries: ContentfulProductItem[] = [];

      const result = mapper.mapEntriesToProductUpsertDtos(entries);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle mixed entries with complete and incomplete data', () => {
      const entries: ContentfulProductItem[] = [
        {
          metadata: { tags: [], concepts: [] },
          sys: {
            space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
            id: 'product-complete',
            type: 'Entry',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z',
            environment: {
              sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
            },
            publishedVersion: 1,
            revision: 1,
            contentType: {
              sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
            },
            locale: 'en-US',
          },
          fields: {
            sku: 100,
            name: 'Complete Product',
            brand: 'Brand',
            model: 'Model',
            category: 'Category',
            color: 'Red',
            price: 10.99,
            currency: 'USD',
            stock: 10,
          },
        },
        {
          metadata: { tags: [], concepts: [] },
          sys: {
            space: { sys: { type: 'Link', linkType: 'Space', id: 'space-id' } },
            id: 'product-incomplete',
            type: 'Entry',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z',
            environment: {
              sys: { type: 'Link', linkType: 'Environment', id: 'env-id' },
            },
            publishedVersion: 1,
            revision: 1,
            contentType: {
              sys: { type: 'Link', linkType: 'ContentType', id: 'product' },
            },
            locale: 'en-US',
          },
          fields: {
            sku: null as any,
            name: '',
            brand: null as any,
            model: null as any,
            category: null as any,
            color: null as any,
            price: null as any,
            currency: null as any,
            stock: null as any,
          },
        },
      ];

      const result = mapper.mapEntriesToProductUpsertDtos(entries);

      expect(result).toHaveLength(2);
      expect(result[0].sku).toBe(100);
      expect(result[0].name).toBe('Complete Product');
      expect(result[1].sku).toBeNull();
      expect(result[1].name).toBe('');
    });
  });
});
