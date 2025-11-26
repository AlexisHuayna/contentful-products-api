import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1764179937496 implements MigrationInterface {
    name = 'AutoMigration1764179937496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_c51eb773bfc52f2a6a0e3d844b" ON "products" ("deleted") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c51eb773bfc52f2a6a0e3d844b"`);
    }

}
