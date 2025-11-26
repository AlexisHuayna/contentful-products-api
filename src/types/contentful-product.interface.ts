interface ContentfulLink {
    sys: {
        type: string;
        linkType: string;
        id: string;
    };
}

interface ContentfulMetadata {
    tags: unknown[];
    concepts: unknown[];
}

export interface ContentfulSys {
    space: ContentfulLink;
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    environment: ContentfulLink;
    publishedVersion: number;
    revision: number;
    contentType: ContentfulLink;
    locale: string;
}

interface ContentfulProductFields {
    sku: number;
    name: string;
    brand: string;
    model: string;
    category: string;
    color: string;
    price: number;
    currency: string;
    stock: number;
}

export interface ContentfulProductItem {
    metadata: ContentfulMetadata;
    sys: ContentfulSys;
    fields: ContentfulProductFields;
}

interface ContentfulProductsResponse {
    total: number;
    skip: number;
    limit: number;
    items: ContentfulProductItem[];
    sys?: ContentfulSys;
}

export type { ContentfulProductsResponse };
