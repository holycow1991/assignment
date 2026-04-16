import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix("api");
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env["PORT"] ?? 3001;
  await app.listen(port);
  logger.log(`API started on http://localhost:${port}/api`);
}

bootstrap().catch((err: unknown) => {
  const logger = new Logger("Bootstrap");
  logger.error(
    "Failed to start application",
    err instanceof Error ? err.stack : undefined,
  );
  process.exit(1);
});
