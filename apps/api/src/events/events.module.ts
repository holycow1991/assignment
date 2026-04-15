import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { EventsApiClient } from "./events-api.client";

@Module({
  imports: [],
  controllers: [EventsController],
  providers: [EventsApiClient, EventsService],
})
export class EventsModule {}
