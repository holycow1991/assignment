export class EventListResponseDto {
  events: EventListUnitResponseDto[];

  constructor(events: Array<EventListUnitResponseDto>) {
    this.events = events.map(
      (e) =>
        new EventListUnitResponseDto({
          externalId: e.externalId,
          genderCode: e.genderCode,
          startDate: e.startDate,
          competitors: e.competitors,
        }),
    );
  }
}

export class EventListUnitResponseDto {
  externalId: string;
  genderCode: string;
  startDate: string;
  competitors: Array<{ name: string }>;

  constructor({
    externalId,
    genderCode,
    startDate,
    competitors,
  }: {
    externalId: string;
    genderCode: string;
    startDate: string;
    competitors: Array<{ name: string }>;
  }) {
    this.externalId = externalId;
    this.genderCode = genderCode;
    this.startDate = startDate;
    this.competitors = competitors;
  }
}
