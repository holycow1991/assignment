import { Injectable } from "@nestjs/common";
import { EventAdapter } from "./event.adapter";
import { mockApiData } from "./mock-api-data";
import { EventsApiClient } from "./events-api.client";
import { EventListResponseDto } from "./dto/event-list-response.dto";

@Injectable()
export class EventsService {
  constructor(private readonly eventsApiClient: EventsApiClient) {}
  getMockResponse() {
    const response = new EventAdapter().adapt(mockApiData);
    return response;
  }

  async getEvents(): Promise<EventListResponseDto> {
    return this.eventsApiClient.getEvents();
  }
}
