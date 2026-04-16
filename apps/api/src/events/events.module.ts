import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { EventsApiClient } from "./events-api.client";
import { EventEntity } from "./entities/event.entity";
import { EventRepository } from "./repositories/event.repository";

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  controllers: [EventsController],
  providers: [EventsApiClient, EventRepository, EventsService],
})
export class EventsModule {}
