import { Controller, Get, Param } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventListResponseDto } from "./dto/event-list-response.dto";
import { GetEventByIdDto } from "./dto/get-event-by-id.dto";
import { Match } from "@assignment/types";
import { MatchResponseDto } from "./dto/match-response.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("")
  getEvents(): Promise<EventListResponseDto> {
    return this.eventsService.getEvents();
  }

  @Get(":id")
  getEventById(@Param() { id }: GetEventByIdDto): Promise<MatchResponseDto> {
    return this.eventsService.getEventById(id);
  }
}
