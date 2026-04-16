import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsModule } from "./events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.getOrThrow<string>("DB_HOST", "localhost"),
        port: configService.getOrThrow<number>("DB_PORT", 5432),
        username: configService.getOrThrow<string>("DB_USER", "postgres"),
        password: configService.getOrThrow<string>("DB_PASS", "postgres"),
        database: configService.getOrThrow<string>("DB_NAME", "assignment"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get<string>("NODE_ENV") !== "production",
        logging: configService.get<string>("NODE_ENV") === "development",
      }),
    }),
    EventsModule,
  ],
})
export class AppModule {}
