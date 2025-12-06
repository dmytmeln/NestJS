import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1764794388192 implements MigrationInterface {
  name = 'InitialSchema1764794388192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "speakers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "bio" text, "photo_url" character varying, "social_links" text, CONSTRAINT "PK_b3818c94af77a0cf73403ecef14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "hall_name" character varying, "online_url" character varying, "event_id" integer, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "quantity" integer NOT NULL, "sold_count" integer NOT NULL DEFAULT '0', "event_id" integer, CONSTRAINT "PK_5510ce7e18a4edc648c9fbfc283" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "banner_image_url" character varying, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "location_type" character varying NOT NULL, "location_address" character varying, "online_url" character varying, "status" character varying NOT NULL DEFAULT 'DRAFT', "organization_id" integer, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "logo_url" character varying, "type" character varying NOT NULL, CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_members" ("id" SERIAL NOT NULL, "role" character varying NOT NULL, "user_id" integer, "organization_id" integer, CONSTRAINT "PK_c2b39d5d072886a4d9c8105eb9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "status" character varying NOT NULL, "provider" character varying, "transaction_id" character varying, "user_id" integer, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tickets" ("id" SERIAL NOT NULL, "ticket_token" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'ISSUED', "checked_in_at" TIMESTAMP, "user_id" integer, "event_id" integer, "ticket_type_id" integer, "payment_id" integer, CONSTRAINT "UQ_c9f231b447d2bd8d5653f916b28" UNIQUE ("ticket_token"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "message" text, "is_read" boolean NOT NULL DEFAULT false, "sent_via_email" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "rating" integer NOT NULL, "comment" text, "user_id" integer, "event_id" integer, "session_id" integer, CONSTRAINT "CHK_1a9834ec19dd28f6208a598536" CHECK (("event_id" IS NOT NULL AND "session_id" IS NULL) OR ("event_id" IS NULL AND "session_id" IS NOT NULL)), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session_speakers" ("session_id" integer NOT NULL, "speaker_id" integer NOT NULL, CONSTRAINT "PK_1e045acbaae611353739e61d856" PRIMARY KEY ("session_id", "speaker_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0b34864cef1c5f92554d6b52b2" ON "session_speakers" ("session_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e16e562ec0a46a3e2acae145a" ON "session_speakers" ("speaker_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_98fcc611bf939573cac8251a2ac" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_types" ADD CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_8557ec49101496ab87be666d633" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_89bde91f78d36ca41e9515d91c6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_2e445270177206a97921e461710" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_a95369aeea12da7fde110e95e00" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_e96fed796fd58a14fed46940764" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_f4f2807aad50f5bcee7baf26623" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_01b034e1b8f42cef320eb71bda3" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_speakers" ADD CONSTRAINT "FK_0b34864cef1c5f92554d6b52b28" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_speakers" ADD CONSTRAINT "FK_6e16e562ec0a46a3e2acae145ad" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session_speakers" DROP CONSTRAINT "FK_6e16e562ec0a46a3e2acae145ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_speakers" DROP CONSTRAINT "FK_0b34864cef1c5f92554d6b52b28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_01b034e1b8f42cef320eb71bda3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_f4f2807aad50f5bcee7baf26623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_e96fed796fd58a14fed46940764"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_a95369aeea12da7fde110e95e00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_2e445270177206a97921e461710"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_89bde91f78d36ca41e9515d91c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_8557ec49101496ab87be666d633"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_types" DROP CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_98fcc611bf939573cac8251a2ac"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6e16e562ec0a46a3e2acae145a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0b34864cef1c5f92554d6b52b2"`,
    );
    await queryRunner.query(`DROP TABLE "session_speakers"`);
    await queryRunner.query(`DROP TABLE "feedbacks"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TABLE "ticket_types"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "speakers"`);
  }
}
