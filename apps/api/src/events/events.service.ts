import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { EventListResponseDto } from "./dto/event-list-response.dto";
import { EventsApiClient } from "./events-api.client";
import { EventRepository } from "./repositories/event.repository";
import { MatchResponseDto } from "./dto/match-response.dto";

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

  async getEventById(id: string) {
    const event = await this.eventRepository.findByExternalId(id);

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (!event.eventData) {
      const eventData = await this.eventsApiClient.getEventById(
        event.sourceEventId,
      );

      event.eventData = eventData;

      await this.eventRepository.upsert([event]);

      const updatedEvent = await this.eventRepository.findByExternalId(id);
      if (!updatedEvent || !updatedEvent.eventData) {
        throw new InternalServerErrorException(
          `Event data for id ${id} not found after update`,
        );
      }
      return new MatchResponseDto(updatedEvent.eventData);
    }

    return new MatchResponseDto(event.eventData);
  }
}
