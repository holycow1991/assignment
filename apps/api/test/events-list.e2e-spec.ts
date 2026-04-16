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
import { EventEntity } from "../src/events/entities/event.entity";
import { buildEventEntity } from "./generators/event-entity.generator";
import { createTestApp, TestAppContext } from "./support/create-test-app";
import { clearDatabase } from "./support/database";
import {
  installUpstreamApiMock,
  UpstreamApiMock,
} from "./support/upstream-api.mock";

describe("GET /api/events", () => {
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

  it("returns cached football events in repository order", async () => {
    const laterEvent = buildEventEntity({
      sourceEventId: "SRC-B",
      endDate: "2024-07-24T21:00:00.000Z",
      startDate: "2024-07-24T19:00:00.000Z",
      competitors: [{ name: "Spain" }, { name: "Japan" }],
    });
    const earlierEvent = buildEventEntity({
      sourceEventId: "SRC-A",
      endDate: "2024-07-24T18:00:00.000Z",
      startDate: "2024-07-24T16:00:00.000Z",
      competitors: [{ name: "France" }, { name: "United States" }],
    });

    await repository.save([laterEvent, earlierEvent]);

    const response = await request(context.app.getHttpServer()).get(
      "/api/events",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      events: [
        {
          externalId: earlierEvent.externalId,
          genderCode: earlierEvent.genderCode,
          startDate: earlierEvent.startDate,
          competitors: earlierEvent.competitors,
        },
        {
          externalId: laterEvent.externalId,
          genderCode: laterEvent.genderCode,
          startDate: laterEvent.startDate,
          competitors: laterEvent.competitors,
        },
      ],
    });
    expect(upstreamApiMock.fetchMock).not.toHaveBeenCalled();
  });
});
