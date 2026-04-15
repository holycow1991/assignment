import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventListResponseDto } from "./dto/event-list-response.dto";

interface CompetitorResults {
  position: string;
  mark: string;
  winnerLoserTie: string;
  medalType: string;
  irm: string;
}

interface Competitor {
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

interface ScheduleDayResponse {
  units: ScheduleUnit[];
}

@Injectable()
export class EventsApiClient {
  private baseUrl: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.get<string>(
      "OLYMPICS_BASE_URL",
      "https://stacy.olympics.com",
    );
  }

  async getMockEvents() {
    const response = await fetch(`${this.baseUrl}/events/mock`);
    if (!response.ok) {
      throw new Error(`Failed to fetch mock events: ${response.statusText}`);
    }
    return response.json();
  }

  async getEvents(): Promise<EventListResponseDto> {
    const urls = this.getOlympicsDateUrls();
    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url).then((res) => {
          if (!res.ok) {
            throw new Error(
              `Failed to fetch events for ${url}: ${res.statusText}`,
            );
          }
          return res.json() as Promise<ScheduleDayResponse>;
        }),
      ),
    );
    return new EventListResponseDto(
      responses
        .flatMap((day) => day.units)
        .filter((unit) => unit.disciplineCode === "FBL")
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
    );
  }

  private getOlympicsDateUrls(): string[] {
    const dates: string[] = [];
    const current = new Date("2024-07-24");
    const end = new Date("2024-08-11");
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates.map(
      (date) => `${this.baseUrl}/srm/data/oly/schedule/day/ENG/${date}.json`,
    );
  }
}
