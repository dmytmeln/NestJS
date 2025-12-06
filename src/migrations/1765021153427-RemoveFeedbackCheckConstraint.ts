import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFeedbackCheckConstraint1765021153427 implements MigrationInterface {
  name = 'RemoveFeedbackCheckConstraint1765021153427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "CHK_1a9834ec19dd28f6208a598536"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_location_type_enum" AS ENUM('ONLINE', 'OFFLINE', 'HYBRID')`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "location_type" TYPE "public"."events_location_type_enum" USING "location_type"::"public"."events_location_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "location_type" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_type_enum" AS ENUM('COMPANY', 'INDIVIDUAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ALTER COLUMN "type" TYPE "public"."organizations_type_enum" USING "type"::"public"."organizations_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ALTER COLUMN "type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_f4f2807aad50f5bcee7baf26623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_01b034e1b8f42cef320eb71bda3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "event_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "session_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_f4f2807aad50f5bcee7baf26623" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_01b034e1b8f42cef320eb71bda3" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_01b034e1b8f42cef320eb71bda3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_f4f2807aad50f5bcee7baf26623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "session_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "event_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_01b034e1b8f42cef320eb71bda3" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_f4f2807aad50f5bcee7baf26623" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ALTER COLUMN "type" TYPE character varying`,
    );
    await queryRunner.query(`DROP TYPE "public"."organizations_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "location_type" TYPE character varying`,
    );
    await queryRunner.query(`DROP TYPE "public"."events_location_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "CHK_1a9834ec19dd28f6208a598536" CHECK ((((event_id IS NOT NULL) AND (session_id IS NULL)) OR ((event_id IS NULL) AND (session_id IS NOT NULL))))`,
    );
  }
}
