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

describe("GET /api/events/refetch/:id", () => {
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

  it("returns 404 when attempting to refetch a missing event", async () => {
    const missingEventId = "00000000-0000-4000-8000-000000000002";

    const response = await request(context.app.getHttpServer()).get(
      `/api/events/refetch/${missingEventId}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: `Event with id ${missingEventId} not found`,
      path: `/api/events/refetch/${missingEventId}`,
      timestamp: expect.any(String),
    });
    expect(upstreamApiMock.fetchMock).not.toHaveBeenCalled();
  });

  it("refetches event details and updates the cached row", async () => {
    const staleEventData = new MatchDataAdapter().process(buildRawMatchData());
    const freshRawMatchData = buildRawMatchData({
      results: {
        extendedInfos: [{ ei_code: "PERIOD", ei_value: "HT" }],
        periods: [
          {
            p_code: "H1",
            home: { score: "0" },
            away: { score: "0" },
          },
          {
            p_code: "TOT",
            home: { score: "0" },
            away: { score: "0" },
          },
        ],
      },
    });
    const freshEventData = new MatchDataAdapter().process(freshRawMatchData);
    const event = buildEventEntity({
      sourceEventId: "DETAIL-3",
      eventData: staleEventData,
    });

    await repository.save(event);
    upstreamApiMock.mockJsonResponse(
      getEventDetailsUrl(event.sourceEventId),
      freshRawMatchData,
    );

    const response = await request(context.app.getHttpServer()).get(
      `/api/events/refetch/${event.externalId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(freshEventData);
    expect(upstreamApiMock.fetchMock).toHaveBeenCalledTimes(1);

    const persistedEvent = await repository.findOneByOrFail({
      externalId: event.externalId,
    });

    expect(persistedEvent.eventData).toEqual(freshEventData);
  });
});
