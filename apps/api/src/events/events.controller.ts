import { Controller, Get } from "@nestjs/common";
import { EventsService } from "./events.service";
import { Match } from "@assignment/types";
import { MatchResponseDto } from "./dto/match-response.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("mock")
  getMockEvent(): MatchResponseDto {
    const mockMatch = this.eventsService.getMockResponse();
    return new MatchResponseDto(mockMatch);
  }

  @Get("")
  getEvents() {
    return this.eventsService.getEvents();
  }
}
