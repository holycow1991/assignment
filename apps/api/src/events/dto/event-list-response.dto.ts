import { ScheduleUnit } from "../events-api.client";

export class EventListResponseDto {
  events: EventListUnitResponseDto[];

  constructor(events: ScheduleUnit[]) {
    this.events = events.map(
      (e) =>
        new EventListUnitResponseDto({
          id: e.id,
          genderCode: e.genderCode,
          startDate: e.startDate,
          competitors: e.competitors,
        }),
    );
  }
}

export class EventListUnitResponseDto {
  id: string;
  genderCode: string;
  startDate: string;
  competitors: Array<{ name: string }>;

  constructor({
    id,
    genderCode,
    startDate,
    competitors,
  }: {
    id: string;
    genderCode: string;
    startDate: string;
    competitors: ScheduleUnit["competitors"];
  }) {
    this.id = id;
    this.genderCode = genderCode;
    this.startDate = startDate;
    this.competitors = competitors.map((c) => ({ name: c.name }));
  }
}
