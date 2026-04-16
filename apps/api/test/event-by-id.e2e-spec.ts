import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import request from "supertest";
import { Repository } from "typeorm";
import { MatchDataAdapter } from "../src/events/match-data.adapter";
import { EventEntity } from "../src/events/entities/event.entity";
import { buildEventEntity } from "./generators/event-entity.generator";
import { buildRawMatchData } from "./generators/raw-match-data.generator";
import { createTestApp, TestAppContext } from "./support/create-test-app";
import { clearDatabase } from "./support/database";
import { getEventDetailsUrl } from "./support/olympics-urls";
import {
  installUpstreamApiMock,
  UpstreamApiMock,
} from "./support/upstream-api.mock";

describe("GET /api/events/:id", () => {
  let context: TestAppContext;
  let repository: Repository<EventEntity>;
  let upstreamApiMock: UpstreamApiMock;

  beforeAll(async () => {
    context = await createTestApp();
    repository = context.dataSource.getRepository(EventEntity);
  });

  beforeEach(async () => {
    await clearDatabase(context.dataSource);
    upstreamApiMock = installUpstreamApiMock();
  });

  afterEach(() => {
    upstreamApiMock.restore();
  });

  afterAll(async () => {
    await context.app.close();
  });

  it("returns 404 when the cached event does not exist", async () => {
    const missingEventId = "00000000-0000-4000-8000-000000000001";

    const response = await request(context.app.getHttpServer()).get(
      `/api/events/${missingEventId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: `Event with id ${missingEventId} not found`,
      path: `/api/events/${missingEventId}`,
      timestamp: expect.any(String),
    });
    expect(upstreamApiMock.fetchMock).not.toHaveBeenCalled();
  });

  it("returns cached event details without calling the upstream API", async () => {
    const rawMatchData = buildRawMatchData();
    const cachedEventData = new MatchDataAdapter().process(rawMatchData);
    const event = buildEventEntity({
      sourceEventId: "DETAIL-1",
      eventData: cachedEventData,
    });

    await repository.save(event);

    const response = await request(context.app.getHttpServer()).get(
      `/api/events/${event.externalId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedEventData);
    expect(upstreamApiMock.fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and persists event details on a cache miss", async () => {
    const rawMatchData = buildRawMatchData({
      results: {
        schedule: {
          startDate: "2024-07-25T18:00:00.000Z",
          venue: { description: "Stade de Marseille" },
          location: { longDescription: "Marseille" },
        },
      },
    });
    const expectedMatch = new MatchDataAdapter().process(rawMatchData);
    const event = buildEventEntity({
      sourceEventId: "DETAIL-2",
      eventData: null,
    });

    await repository.save(event);
    upstreamApiMock.mockJsonResponse(
      getEventDetailsUrl(event.sourceEventId),
      rawMatchData,
    );

    const response = await request(context.app.getHttpServer()).get(
      `/api/events/${event.externalId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedMatch);
    expect(upstreamApiMock.fetchMock).toHaveBeenCalledTimes(1);

    const persistedEvent = await repository.findOneByOrFail({
      externalId: event.externalId,
    });

    expect(persistedEvent.eventData).toEqual(expectedMatch);
  });
});
