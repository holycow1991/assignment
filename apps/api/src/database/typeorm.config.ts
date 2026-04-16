import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";
import { join } from "node:path";
import { EventEntity } from "../events/entities/event.entity";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getRequiredString(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRequiredNumber(name: string, fallback?: number): number {
  const raw =
    process.env[name] ??
    (fallback !== undefined ? String(fallback) : undefined);

  if (!raw) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return value;
}

export function getTypeOrmConfig(): DataSourceOptions & TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: getRequiredString("DB_HOST", "localhost"),
    port: getRequiredNumber("DB_PORT", 5432),
    username: getRequiredString("DB_USER", "postgres"),
    password: getRequiredString("DB_PASS", "postgres"),
    database: getRequiredString("DB_NAME", "assignment"),
    entities: [EventEntity],
    migrations: [join(__dirname, "migrations", "*.{ts,js}")],
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
    migrationsRun: !isProduction(),
    logging: process.env.NODE_ENV === "development",
  };
}
