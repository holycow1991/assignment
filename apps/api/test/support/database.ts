import { DataSource } from "typeorm";

function assertTestDatabase(): void {
  if (process.env.DB_NAME !== "assignment_test") {
    throw new Error(
      `Refusing to modify database outside test environment: ${process.env.DB_NAME ?? "undefined"}`,
    );
  }
}

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  assertTestDatabase();
  await dataSource.query('TRUNCATE TABLE "events" RESTART IDENTITY CASCADE');
}
