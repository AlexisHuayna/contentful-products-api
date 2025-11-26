# Products API – Contentful Sync (NestJS)

This project is a small backend service built with **NestJS** and **PostgreSQL**.  
Main purpose is to sync products from **Contentful**, store them locally, and expose two types of APIs:

- A **public API** to list active products.
- A **private API** (JWT-protected) that exposes a set of product reports.

Everything runs inside **Docker**, including database migrations.  
The API is fully documented through **Swagger**.

---

## 🚀 Tech Stack

- Node.js **20 LTS**
- NestJS **10**
- TypeScript
- PostgreSQL **16**
- TypeORM (with migrations)
- Contentful Delivery API
- JWT Authentication (Passport)
- Docker & Docker Compose
- Swagger (OpenAPI)

---

## 📦 Architecture Overview

### **ContentfulModule**
Handles integration with Contentful using Nest’s `HttpModule`.  
Responsible for fetching all products from the CMS.

### **ProductsModule**
- Defines the `Product` entity.
- Maps Contentful entries into internal DTOs.
- Syncs products into the database.
- Soft-deletes products (and prevents “reviving” deleted products).

### **ReportsModule** (Private)
JWT-protected endpoints providing:
- Deleted products percentage
- Active products percentage
- Average price per category

### **AuthModule**
- Simple login endpoint
- Issues JWT tokens
- Used only for this challenge, but extendable to real users

---

## 🗃 Product Model (Database)

The `Product` table includes:

- `id` (uuid)
- `externalId` (unique identifier from Contentful)
- `sku`, `name`, `brand`, `model`, `category`, `color`
- `price`, `currency`, `stock`
- `contentCreatedAt` (timestamptz, nullable - creation date from Contentful)
- `contentUpdatedAt` (timestamptz, nullable - last update date from Contentful)
- `createdAt` (timestamptz - record creation timestamp)
- `updatedAt` (timestamptz - record last update timestamp)
- `deleted` (boolean - soft delete flag)
- `deletedAt` (timestamptz, nullable - soft delete timestamp)

### Soft Delete Behavior
- Deleted products never appear in public listing.
- Contentful sync does **not** revive soft-deleted products.
- New or updated items are processed in batches for performance.

---

## 🔄 Sync Flow

1. Fetch paginated products from Contentful.
2. Map each entry to an internal `UpsertProductDto`.
3. Load existing products using one DB query (`IN(externalIds)`).
4. Decide whether to creating, updating, or ignoring each item.
5. Save changes in chunks to avoid database overload.

---

## 🌐 Public API

### `GET /api/v1/products`
Returns paginated and filtered list of active products.

Available filters:
- `name`
- `category`
- Pagination (`page`, `limit`)

Example:

