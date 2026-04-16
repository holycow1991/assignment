import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ScheduleDayResponse } from "./event.types";
import { ScheduleDayListResponseDto } from "./dto/schedule-day-list-response.dto";

@Injectable()
export class EventsApiClient {
  private baseUrl: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.get<string>(
      "OLYMPICS_BASE_URL",
      "https://stacy.olympics.com",
    );
  }
  async getEvents(): Promise<ScheduleDayListResponseDto> {
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
    return new ScheduleDayListResponseDto(
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
