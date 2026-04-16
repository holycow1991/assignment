import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTypeOrmConfig } from "./database/typeorm.config";
import { EventsModule } from "./events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => getTypeOrmConfig(),
    }),
    EventsModule,
  ],
})
export class AppModule {}
