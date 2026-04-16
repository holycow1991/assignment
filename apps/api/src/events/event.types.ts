export interface CompetitorResults {
  position: string;
  mark: string;
  winnerLoserTie: string;
  medalType: string;
  irm: string;
}

export interface Competitor {
  code: string;
  noc: string;
  name: string;
  order: number;
  results: CompetitorResults;
}

export interface ScheduleUnit {
  disciplineName: string;
  eventUnitName: string;
  id: string;
  disciplineCode: string;
  genderCode: string;
  eventCode: string;
  phaseCode: string;
  eventId: string;
  eventName: string;
  phaseId: string;
  phaseName: string;
  disciplineId: string;
  eventOrder: number;
  phaseType: string;
  eventUnitType: string;
  olympicDay: string;
  startDate: string;
  endDate: string;
  hideStartDate: boolean;
  hideEndDate: boolean;
  startText: string;
  order: number;
  venue: string;
  venueDescription: string;
  location: string;
  locationDescription: string;
  status: string;
  statusDescription: string;
  medalFlag: number;
  liveFlag: boolean;
  scheduleItemType: string;
  unitNum: string;
  sessionCode: string;
  competitors: Competitor[];
  extraData: { detailUrl: string };
}

export interface ScheduleDayResponse {
  units: ScheduleUnit[];
}
