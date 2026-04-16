import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { AppModule } from "../../src/app.module";
import { GlobalExceptionFilter } from "../../src/common/filters/global-exception.filter";

export interface TestAppContext {
  app: INestApplication;
  dataSource: DataSource;
}

export async function createTestApp(): Promise<TestAppContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication({ logger: false });

  app.setGlobalPrefix("api");
  app.enableCors();
  app.useLogger(false);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.init();

  return {
    app,
    dataSource: app.get(DataSource),
  };
}
