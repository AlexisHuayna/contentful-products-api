export class ProductUpsertDto { 
    externalId: string;
    sku: number | null;
    name: string;
    brand: string | null;
    model: string | null;
    category: string | null;
    color: string | null;
    price: number | null;
    currency: string | null;
    stock: number | null;
    contentCreatedAt: Date | null;
    contentUpdatedAt: Date | null;
}