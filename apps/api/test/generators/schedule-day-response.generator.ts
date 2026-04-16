import type {
  ScheduleDayResponse,
  ScheduleUnit,
} from "../../src/events/event.types";

let sequence = 0;

export function buildScheduleUnit(
  overrides: Partial<ScheduleUnit> = {},
): ScheduleUnit {
  sequence += 1;

  return {
    disciplineName: "Football",
    eventUnitName: `Men Group Match ${sequence}`,
    id: `SCH-${sequence}`,
    disciplineCode: "FBL",
    genderCode: "M",
    eventCode: `EV-${sequence}`,
    phaseCode: `PH-${sequence}`,
    eventId: `EVENT-${sequence}`,
    eventName: "Men's Tournament",
    phaseId: `PHASE-${sequence}`,
    phaseName: "Group Stage",
    disciplineId: `DISC-${sequence}`,
    eventOrder: sequence,
    phaseType: "ROUND_ROBIN",
    eventUnitType: "MATCH",
    olympicDay: `Day ${sequence}`,
    startDate: "2024-07-24T17:00:00.000Z",
    endDate: "2024-07-24T19:00:00.000Z",
    hideStartDate: false,
    hideEndDate: false,
    startText: "17:00",
    order: sequence,
    venue: "Parc des Princes",
    venueDescription: "Paris stadium",
    location: "Paris",
    locationDescription: "Paris",
    status: "SCHEDULED",
    statusDescription: "Scheduled",
    medalFlag: 0,
    liveFlag: false,
    scheduleItemType: "MATCH",
    unitNum: `${sequence}`,
    sessionCode: `SESSION-${sequence}`,
    competitors: [
      {
        code: `HOME-${sequence}`,
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
        code: `AWAY-${sequence}`,
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
    extraData: {
      detailUrl: `/events/${sequence}`,
    },
    ...overrides,
  };
}

export function buildScheduleDayResponse(
  units: ScheduleUnit[] = [],
): ScheduleDayResponse {
  return { units };
}
