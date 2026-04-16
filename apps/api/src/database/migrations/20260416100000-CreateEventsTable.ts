import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventsTable20260416100000 implements MigrationInterface {
  name = "CreateEventsTable20260416100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "externalId" character varying NOT NULL,
        "sourceEventId" character varying NOT NULL,
        "disciplineName" character varying NOT NULL,
        "disciplineCode" character varying NOT NULL,
        "eventUnitName" character varying NOT NULL,
        "eventName" character varying NOT NULL,
        "phaseName" character varying NOT NULL,
        "genderCode" character varying NOT NULL,
        "olympicDay" character varying NOT NULL,
        "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "venue" character varying NOT NULL,
        "venueDescription" character varying NOT NULL,
        "location" character varying NOT NULL,
        "locationDescription" character varying NOT NULL,
        "status" character varying NOT NULL,
        "statusDescription" character varying NOT NULL,
        "scheduleItemType" character varying NOT NULL,
        "competitors" jsonb NOT NULL,
        "eventData" jsonb,
        CONSTRAINT "PK_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_events_externalId" UNIQUE ("externalId"),
        CONSTRAINT "UQ_events_sourceEventId" UNIQUE ("sourceEventId")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_events_startDate" ON "events" ("startDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_events_endDate" ON "events" ("endDate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_events_endDate"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_startDate"`);
    await queryRunner.query(`DROP TABLE "events"`);
  }
}
