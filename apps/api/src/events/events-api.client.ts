import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RawMatchData, ScheduleDayResponse } from "./event.types";
import { ScheduleDayListResponseDto } from "./dto/schedule-day-list-response.dto";
import { MatchDataAdapter } from "./match-data.adapter";
import { MatchResponseDto } from "./dto/match-response.dto";

@Injectable()
export class EventsApiClient {
  private baseUrl: string;
  private readonly logger = new Logger(EventsApiClient.name);

  constructor(configService: ConfigService) {
    this.baseUrl = configService.getOrThrow<string>(
      "OLYMPICS_BASE_URL",
      "https://stacy.olympics.com",
    );
  }

  async getEvents(): Promise<ScheduleDayListResponseDto> {
    const urls = this.getOlympicsDateUrls();
    this.logger.log(
      `Fetching schedule data from upstream for ${urls.length} days`,
    );

    const responses = await Promise.all(
      urls.map((url) =>
        this.fetchJson<ScheduleDayResponse>(url, "schedule data"),
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

  async getEventById(sourceEventId: string) {
    const url = `${this.baseUrl}/OG2024/data/RES_ByRSC_H2H~comp=OG2024~disc=FBL~rscResult=${sourceEventId}~lang=ENG.json`;
    this.logger.log(
      `Fetching event details from upstream for ${sourceEventId}`,
    );
    const matchData = await this.fetchJson<RawMatchData>(url, "event details", {
      sourceEventId,
    });

    const translatedData = new MatchDataAdapter().process(matchData);

    return new MatchResponseDto(translatedData);
  }

  private async fetchJson<T>(
    url: string,
    resource: string,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch (error) {
      this.logger.error(
        `Failed to reach upstream ${resource}: ${JSON.stringify({ url, ...metadata })}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadGatewayException(`Failed to reach upstream ${resource}`);
    }

    if (!response.ok) {
      this.logger.warn(
        `Upstream ${resource} request failed: ${JSON.stringify({
          url,
          status: response.status,
          statusText: response.statusText,
          ...metadata,
        })}`,
      );
      throw new BadGatewayException(`Failed to fetch ${resource}`);
    }

    return response.json() as Promise<T>;
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
