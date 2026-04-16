export class EventListResponseDto {
  events: EventListUnitResponseDto[];

  constructor(
    events: Array<{
      sourceEventId: string;
      genderCode: string;
      startDate: string;
      competitors: Array<{ name: string }>;
    }>,
  ) {
    this.events = events.map(
      (e) =>
        new EventListUnitResponseDto({
          sourceEventId: e.sourceEventId,
          genderCode: e.genderCode,
          startDate: e.startDate,
          competitors: e.competitors,
        }),
    );
  }
}

export class EventListUnitResponseDto {
  sourceEventId: string;
  genderCode: string;
  startDate: string;
  competitors: Array<{ name: string }>;

  constructor({
    sourceEventId,
    genderCode,
    startDate,
    competitors,
  }: {
    sourceEventId: string;
    genderCode: string;
    startDate: string;
    competitors: Array<{ name: string }>;
  }) {
    this.sourceEventId = sourceEventId;
    this.genderCode = genderCode;
    this.startDate = startDate;
    this.competitors = competitors;
  }
}
