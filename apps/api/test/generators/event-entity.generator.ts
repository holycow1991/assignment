import { randomUUID } from "node:crypto";
import { EventEntity } from "../../src/events/entities/event.entity";

export function buildEventEntity(
  overrides: Partial<EventEntity> = {},
): EventEntity {
  const entity = new EventEntity();

  Object.assign(entity, {
    id: randomUUID(),
    externalId: randomUUID(),
    sourceEventId: `SRC-${randomUUID()}`,
    disciplineName: "Football",
    disciplineCode: "FBL",
    eventUnitName: "Men Group A",
    eventName: "Men's Tournament",
    phaseName: "Group Stage",
    genderCode: "M",
    olympicDay: "Day 1",
    startDate: "2024-07-24T17:00:00.000Z",
    endDate: "2024-07-24T19:00:00.000Z",
    venue: "Parc des Princes",
    venueDescription: "Paris stadium",
    location: "Paris",
    locationDescription: "Paris",
    status: "SCHEDULED",
    statusDescription: "Scheduled",
    scheduleItemType: "MATCH",
    competitors: [{ name: "France" }, { name: "United States" }],
    eventData: null,
  } satisfies Omit<EventEntity, "generateExternalId">);

  Object.assign(entity, overrides);

  return entity;
}
