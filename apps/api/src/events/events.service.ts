import { Injectable } from "@nestjs/common";
import { EventListResponseDto } from "./dto/event-list-response.dto";
import { EventsApiClient } from "./events-api.client";
import { EventRepository } from "./repositories/event.repository";

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventsApiClient: EventsApiClient,
  ) {}

  async getEvents(): Promise<EventListResponseDto> {
    const cachedEvents = await this.eventRepository.findAll();

    if (cachedEvents.length > 0) {
      return new EventListResponseDto(cachedEvents);
    }

    const { units } = await this.eventsApiClient.getEvents();
    await this.eventRepository.upsert(units.map((unit) => unit.toEntity()));

    const entities = await this.eventRepository.findAll();

    return new EventListResponseDto(entities);
  }
}
