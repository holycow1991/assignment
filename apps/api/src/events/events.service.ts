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
    const events = await this.eventRepository.findAll();

    return new EventListResponseDto(events);
  }

  async refetchEvents(): Promise<EventListResponseDto> {
    this.logger.log("Refetching events from upstream schedule");
    const { units } = await this.eventsApiClient.getEvents();
    await this.eventRepository.upsert(units.map((unit) => unit.toEntity()));

    const entities = await this.eventRepository.findAll();

    this.logger.log(`Events refreshed from upstream: ${entities.length}`);

    return new EventListResponseDto(entities);
  }

  async refetchEventById(id: string): Promise<MatchResponseDto> {
    const event = await this.eventRepository.findByExternalId(id);

    if (!event) {
      this.logger.warn(`Requested event for refetch was not found: ${id}`);
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    this.logger.log(
      `Refetching event details from upstream for ${id} (${event.sourceEventId})`,
    );
    const eventData = await this.eventsApiClient.getEventById(
      event.sourceEventId,
    );

    event.eventData = eventData;
    await this.eventRepository.upsert([event]);

    return new MatchResponseDto(eventData);
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
