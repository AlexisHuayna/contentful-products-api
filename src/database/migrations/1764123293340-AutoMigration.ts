import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1764123293340 implements MigrationInterface {
  name = 'AutoMigration1764123293340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalId" character varying NOT NULL, "sku" integer, "name" character varying NOT NULL, "brand" character varying, "model" character varying, "category" character varying, "color" character varying, "price" numeric, "currency" character varying, "stock" integer, "contentCreatedAt" TIMESTAMP WITH TIME ZONE, "contentUpdatedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_078766bd87e61a8a249a9667664" UNIQUE ("externalId"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_078766bd87e61a8a249a966766" ON "products" ("externalId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe52498d76ba7545ad5b2553c0" ON "products" ("model") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3932231d2385ac248d0888d95" ON "products" ("category") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3932231d2385ac248d0888d95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe52498d76ba7545ad5b2553c0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_078766bd87e61a8a249a966766"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
