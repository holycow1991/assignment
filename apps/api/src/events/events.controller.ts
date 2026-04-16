import { Controller, Get } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventListResponseDto } from "./dto/event-list-response.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("")
  getEvents(): Promise<EventListResponseDto> {
    return this.eventsService.getEvents();
  }
}
