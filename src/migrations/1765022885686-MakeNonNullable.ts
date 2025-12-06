import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeNonNullable1765022885686 implements MigrationInterface {
  name = 'MakeNonNullable1765022885686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
