import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationRemoveSessionIdColumn1765054437928 implements MigrationInterface {
    name = 'NotificationRemoveSessionIdColumn1765054437928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "session_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "session_id" integer`);
    }

}
