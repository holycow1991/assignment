import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EventListResponseDto } from "./dto/event-list-response.dto";
import { EventsApiClient } from "./events-api.client";
import { EventRepository } from "./repositories/event.repository";
import { MatchResponseDto } from "./dto/match-response.dto";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventsApiClient: EventsApiClient,
  ) {}

  async getEvents(): Promise<EventListResponseDto> {
    const cachedEvents = await this.eventRepository.findAll();

    if (cachedEvents.length > 0) {
      this.logger.log(`Returning ${cachedEvents.length} cached events`);
      return new EventListResponseDto(cachedEvents);
    }

    this.logger.log("Event cache miss, fetching upstream schedule");
    const { units } = await this.eventsApiClient.getEvents();
    await this.eventRepository.upsert(units.map((unit) => unit.toEntity()));

    const entities = await this.eventRepository.findAll();

    this.logger.log(
      `Cached events refreshed from upstream: ${entities.length}`,
    );

    return new EventListResponseDto(entities);
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findByExternalId(id);

    if (!event) {
      this.logger.warn(`Requested event was not found: ${id}`);
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (!event.eventData) {
      this.logger.log(
        `Event details cache miss, fetching upstream details for ${id} (${event.sourceEventId})`,
      );
      const eventData = await this.eventsApiClient.getEventById(
        event.sourceEventId,
      );

      event.eventData = eventData;

      await this.eventRepository.upsert([event]);

      const updatedEvent = await this.eventRepository.findByExternalId(id);
      if (!updatedEvent || !updatedEvent.eventData) {
        this.logger.error(
          `Event detail cache update did not persist expected data for ${id} (${event.sourceEventId})`,
          undefined,
        );
        throw new InternalServerErrorException(
          `Event data for id ${id} not found after update`,
        );
      }

      this.logger.log(`Returning freshly cached event details for ${id}`);
      return new MatchResponseDto(updatedEvent.eventData);
    }

    this.logger.log(`Returning cached event details for ${id}`);
    return new MatchResponseDto(event.eventData);
  }
}
