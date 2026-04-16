import { EventEntity } from "../entities/event.entity";
import { Competitor, ScheduleDayResponse, ScheduleUnit } from "../event.types";

class CompetitorDto implements Competitor {
  code: string;
  noc: string;
  name: string;
  order: number;
  results: {
    position: string;
    mark: string;
    winnerLoserTie: string;
    medalType: string;
    irm: string;
  };

  constructor(data: Competitor) {
    this.code = data.code;
    this.noc = data.noc;
    this.name = data.name;
    this.order = data.order;
    this.results = data.results;
  }
}

export class ScheduleUnitDto implements ScheduleUnit {
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
  competitors: CompetitorDto[];
  extraData: { detailUrl: string };

  constructor(data: ScheduleUnit) {
    this.disciplineName = data.disciplineName;
    this.eventUnitName = data.eventUnitName;
    this.id = data.id;
    this.disciplineCode = data.disciplineCode;
    this.genderCode = data.genderCode;
    this.eventCode = data.eventCode;
    this.phaseCode = data.phaseCode;
    this.eventId = data.eventId;
    this.eventName = data.eventName;
    this.phaseId = data.phaseId;
    this.phaseName = data.phaseName;
    this.disciplineId = data.disciplineId;
    this.eventOrder = data.eventOrder;
    this.phaseType = data.phaseType;
    this.eventUnitType = data.eventUnitType;
    this.olympicDay = data.olympicDay;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.hideStartDate = data.hideStartDate;
    this.hideEndDate = data.hideEndDate;
    this.startText = data.startText;
    this.order = data.order;
    this.venue = data.venue;
    this.venueDescription = data.venueDescription;
    this.location = data.location;
    this.locationDescription = data.locationDescription;
    this.status = data.status;
    this.statusDescription = data.statusDescription;
    this.medalFlag = data.medalFlag;
    this.liveFlag = data.liveFlag;
    this.scheduleItemType = data.scheduleItemType;
    this.unitNum = data.unitNum;
    this.sessionCode = data.sessionCode;
    this.competitors = data.competitors.map(
      (competitor) => new CompetitorDto(competitor),
    );
    this.extraData = data.extraData;
  }

  toEntity(): EventEntity {
    const entity = new EventEntity();
    entity.sourceEventId = this.id;
    entity.disciplineName = this.disciplineName;
    entity.disciplineCode = this.disciplineCode;
    entity.eventUnitName = this.eventUnitName;
    entity.eventName = this.eventName;
    entity.phaseName = this.phaseName;
    entity.genderCode = this.genderCode;
    entity.olympicDay = this.olympicDay;
    entity.startDate = this.startDate;
    entity.endDate = this.endDate;
    entity.venue = this.venue;
    entity.venueDescription = this.venueDescription;
    entity.location = this.location;
    entity.locationDescription = this.locationDescription;
    entity.status = this.status;
    entity.statusDescription = this.statusDescription;
    entity.scheduleItemType = this.scheduleItemType;
    entity.competitors = this.competitors.map((competitor) => ({
      name: competitor.name,
    }));
    return entity;
  }
}

export class ScheduleDayListResponseDto implements ScheduleDayResponse {
  units: ScheduleUnitDto[];

  constructor(units: ScheduleUnit[]) {
    this.units = units.map((unit) => new ScheduleUnitDto(unit));
  }
}
