import { MigrationInterface, QueryRunner } from 'typeorm';

export class Changes1764851790432 implements MigrationInterface {
  name = 'Changes1764851790432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "status" character varying NOT NULL DEFAULT 'UPCOMING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "event_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "session_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying(20) NOT NULL DEFAULT 'ATTENDEE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP COLUMN "role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD "role" character varying(20) NOT NULL DEFAULT 'MEMBER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP COLUMN "role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD "role" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "session_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "event_id"`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "status"`);
  }
}
