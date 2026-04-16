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

export interface ExtendedInfo {
  ei_code: string;
  ei_value: string;
}

export interface Period {
  p_code: string;
  home: { score: string };
  away: { score: string };
}

export interface PbpAthlete {
  pbpat_code: string;
  pbpat_bib?: string;
  pbpat_role?: string;
}

export interface PbpCompetitor {
  pbpc_code: string;
  athletes?: PbpAthlete[];
}

export interface PbpAction {
  pbpa_Action: string;
  pbpa_Result?: string;
  pbpa_When: string;
  competitors?: PbpCompetitor[];
}

export interface PlayByPeriod {
  subcode: string;
  actions: PbpAction[];
}

export interface EventUnitEntry {
  eue_code: string;
  eue_value: string;
  eue_pos?: string;
}

export interface AthleteData {
  code: string;
  givenName?: string;
  familyName?: string;
  registeredEvents?: Array<{
    eventEntries?: Array<{ ee_code: string; ee_value: string }>;
  }>;
}

export interface TeamAthlete {
  bib?: string;
  athlete: AthleteData;
  eventUnitEntries?: EventUnitEntry[];
}

export interface TeamCoach {
  function: { functionCode: string };
  coach: { givenName?: string; familyName?: string };
}

export interface Item {
  teamCode?: string;
  participant: { name: string };
  eventUnitEntries?: EventUnitEntry[];
  teamAthletes?: TeamAthlete[];
  teamCoaches?: TeamCoach[];
}

export interface RawMatchData {
  results: {
    eventUnit: { description: string };
    extendedInfos: ExtendedInfo[];
    periods: Period[];
    schedule: {
      startDate: string;
      venue?: { description: string };
      location?: { longDescription: string };
    };
    items: Item[];
    playByPlay?: PlayByPeriod[];
  };
}
