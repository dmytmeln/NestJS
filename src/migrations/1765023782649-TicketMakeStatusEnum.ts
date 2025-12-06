import { MigrationInterface, QueryRunner } from 'typeorm';

export class TicketMakeStatusEnum1765023782649 implements MigrationInterface {
  name = 'TicketMakeStatusEnum1765023782649';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum" AS ENUM('ISSUED', 'USED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'ISSUED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "status" character varying NOT NULL DEFAULT 'ISSUED'`,
    );
  }
}
