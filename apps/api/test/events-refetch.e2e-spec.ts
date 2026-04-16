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
import {
  buildScheduleDayResponse,
  buildScheduleUnit,
} from "./generators/schedule-day-response.generator";
import { createTestApp, TestAppContext } from "./support/create-test-app";
import { clearDatabase } from "./support/database";
import {
  getOlympicsScheduleDates,
  getScheduleUrl,
} from "./support/olympics-urls";
import {
  installUpstreamApiMock,
  UpstreamApiMock,
} from "./support/upstream-api.mock";

describe("GET /api/events/refetch", () => {
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

  it("fetches football schedule data, upserts it, and returns cached rows", async () => {
    const dates = getOlympicsScheduleDates();
    const firstFootballUnit = buildScheduleUnit({
      id: "MATCH-1",
      startDate: "2024-07-24T16:00:00.000Z",
      endDate: "2024-07-24T18:00:00.000Z",
      competitors: [
        {
          code: "HOME-1",
          noc: "FRA",
          name: "France",
          order: 1,
          results: {
            position: "",
            mark: "",
            winnerLoserTie: "",
            medalType: "",
            irm: "",
          },
        },
        {
          code: "AWAY-1",
          noc: "USA",
          name: "United States",
          order: 2,
          results: {
            position: "",
            mark: "",
            winnerLoserTie: "",
            medalType: "",
            irm: "",
          },
        },
      ],
    });
    const secondFootballUnit = buildScheduleUnit({
      id: "MATCH-2",
      startDate: "2024-07-25T18:00:00.000Z",
      endDate: "2024-07-25T20:00:00.000Z",
      competitors: [
        {
          code: "HOME-2",
          noc: "ESP",
          name: "Spain",
          order: 1,
          results: {
            position: "",
            mark: "",
            winnerLoserTie: "",
            medalType: "",
            irm: "",
          },
        },
        {
          code: "AWAY-2",
          noc: "JPN",
          name: "Japan",
          order: 2,
          results: {
            position: "",
            mark: "",
            winnerLoserTie: "",
            medalType: "",
            irm: "",
          },
        },
      ],
    });
    const nonFootballUnit = buildScheduleUnit({
      id: "MATCH-3",
      disciplineCode: "SWM",
      disciplineName: "Swimming",
    });

    for (const date of dates) {
      upstreamApiMock.mockJsonResponse(
        getScheduleUrl(date),
        buildScheduleDayResponse(),
      );
    }
    upstreamApiMock.mockJsonResponse(
      getScheduleUrl("2024-07-24"),
      buildScheduleDayResponse([firstFootballUnit, nonFootballUnit]),
    );
    upstreamApiMock.mockJsonResponse(
      getScheduleUrl("2024-07-25"),
      buildScheduleDayResponse([secondFootballUnit]),
    );

    const response = await request(context.app.getHttpServer()).get(
      "/api/events/refetch",
    );

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(2);
    expect(response.body.events).toEqual([
      {
        externalId: expect.any(String),
        genderCode: "M",
        startDate: "2024-07-24T16:00:00.000Z",
        competitors: [{ name: "France" }, { name: "United States" }],
      },
      {
        externalId: expect.any(String),
        genderCode: "M",
        startDate: "2024-07-25T18:00:00.000Z",
        competitors: [{ name: "Spain" }, { name: "Japan" }],
      },
    ]);

    const savedEvents = await repository.find({
      order: { endDate: "ASC", sourceEventId: "ASC" },
    });

    expect(savedEvents).toHaveLength(2);
    expect(savedEvents.map((event) => event.sourceEventId)).toEqual([
      "MATCH-1",
      "MATCH-2",
    ]);
  });

  it("returns a filtered upstream error when the schedule fetch fails", async () => {
    const dates = getOlympicsScheduleDates();

    for (const date of dates) {
      upstreamApiMock.mockJsonResponse(
        getScheduleUrl(date),
        buildScheduleDayResponse(),
      );
    }
    upstreamApiMock.mockJsonResponse(
      getScheduleUrl("2024-07-24"),
      { message: "upstream failure" },
      502,
    );

    const response = await request(context.app.getHttpServer()).get(
      "/api/events/refetch",
    );

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      statusCode: 502,
      message: "Failed to fetch schedule data",
      path: "/api/events/refetch",
      timestamp: expect.any(String),
    });
    expect(await repository.count()).toBe(0);
  });
});
