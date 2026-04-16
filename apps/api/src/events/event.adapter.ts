import type {
  Competition,
  Lineups,
  Match,
  MatchStatus,
  Player,
  Score,
  Scorer,
  ScorerType,
  TeamLineup,
  Venue,
} from "@assignment/types";

// ── Raw Olympics H2H response types ──────────────────────────────────────────

interface ExtendedInfo {
  ei_code: string;
  ei_value: string;
}

interface Period {
  p_code: string;
  home: { score: string };
  away: { score: string };
}

interface PbpAthlete {
  pbpat_code: string;
  pbpat_bib?: string;
  pbpat_role?: string;
}

interface PbpCompetitor {
  pbpc_code: string;
  athletes?: PbpAthlete[];
}

interface PbpAction {
  pbpa_Action: string;
  pbpa_Result?: string;
  pbpa_When: string;
  competitors?: PbpCompetitor[];
}

interface PlayByPeriod {
  subcode: string;
  actions: PbpAction[];
}

interface EventUnitEntry {
  eue_code: string;
  eue_value: string;
  eue_pos?: string;
}

interface TeamAthlete {
  bib?: string;
  athlete: {
    code: string;
    givenName?: string;
    familyName?: string;
    registeredEvents?: Array<{
      eventEntries?: Array<{ ee_code: string; ee_value: string }>;
    }>;
  };
  eventUnitEntries?: EventUnitEntry[];
}

interface TeamCoach {
  function: { functionCode: string };
  coach: { givenName?: string; familyName?: string };
}

interface Item {
  teamCode?: string;
  participant: { name: string };
  eventUnitEntries?: EventUnitEntry[];
  teamAthletes?: TeamAthlete[];
  teamCoaches?: TeamCoach[];
}

export interface H2HResponse {
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

// ── Adapter ───────────────────────────────────────────────────────────────────

export class EventAdapter {
  adapt(raw: H2HResponse): Match {
    const { results } = raw;

    const homeItem = this.findTeamItem(results.items, "HOME");
    const awayItem = this.findTeamItem(results.items, "AWAY");
    const athleteLookup = this.buildAthleteLookup(results.items);
    const teamLookup = this.buildTeamLookup(results.items);

    return {
      competition: this.mapCompetition(results.eventUnit.description),
      venue: this.mapVenue(results.schedule),
      kickoff: results.schedule.startDate,
      status: this.mapStatus(results.extendedInfos),
      teams: {
        home: homeItem.participant.name,
        away: awayItem.participant.name,
      },
      score: this.mapScore(results.periods),
      scorers: this.mapScorers(
        results.playByPlay ?? [],
        athleteLookup,
        teamLookup,
      ),
      lineups: this.mapLineups(homeItem, awayItem),
    };
  }

  private findTeamItem(items: Item[], side: "HOME" | "AWAY"): Item {
    const found = items.find((item) =>
      item.eventUnitEntries?.some(
        (e) => e.eue_code === "HOME_AWAY" && e.eue_value === side,
      ),
    );
    return found ?? (side === "HOME" ? items[0]! : items[1]!);
  }

  private buildAthleteLookup(items: Item[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const item of items) {
      for (const ta of item.teamAthletes ?? []) {
        const name =
          `${ta.athlete.givenName ?? ""} ${ta.athlete.familyName ?? ""}`.trim();
        map.set(ta.athlete.code, name);
      }
    }
    return map;
  }

  private buildTeamLookup(items: Item[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.teamCode) map.set(item.teamCode, item.participant.name);
    }
    return map;
  }

  private mapCompetition(roundDescription: string): Competition {
    return {
      name: "Olympic Games Paris 2024",
      season: "2024",
      round: roundDescription,
    };
  }

  private mapVenue(schedule: H2HResponse["results"]["schedule"]): Venue {
    const name = schedule.venue?.description ?? "";
    const longDesc = schedule.location?.longDescription ?? "";
    const city = longDesc.split(", ").at(-1) ?? longDesc;
    return { name, city };
  }

  private mapStatus(extendedInfos: ExtendedInfo[]): MatchStatus {
    const val = extendedInfos.find((e) => e.ei_code === "PERIOD")?.ei_value;
    const statusMap: Partial<Record<string, MatchStatus>> = {
      FT: "FT",
      HT: "HT",
      "1H": "LIVE",
      "2H": "LIVE",
      ET: "LIVE",
      PEN: "PEN",
      AET: "AET",
    };
    return statusMap[val ?? ""] ?? "SCHEDULED";
  }

  private mapScore(periods: Period[]): Score {
    const tot = periods.find((p) => p.p_code === "TOT");
    const h1 = periods.find((p) => p.p_code === "H1");
    return {
      home: parseInt(tot?.home.score ?? "0", 10),
      away: parseInt(tot?.away.score ?? "0", 10),
      halfTime: {
        home: parseInt(h1?.home.score ?? "0", 10),
        away: parseInt(h1?.away.score ?? "0", 10),
      },
    };
  }

  private mapScorers(
    playByPlay: PlayByPeriod[],
    athleteLookup: Map<string, string>,
    teamLookup: Map<string, string>,
  ): Scorer[] {
    const scorers: Scorer[] = [];

    for (const period of playByPlay) {
      for (const action of period.actions) {
        const isGoal =
          (action.pbpa_Action === "SHOT" || action.pbpa_Action === "PEN") &&
          action.pbpa_Result === "GOAL";
        if (!isGoal) continue;

        const competitor = action.competitors?.[0];
        if (!competitor) continue;

        const scorerAthlete = competitor.athletes?.find(
          (a) => a.pbpat_role === "SCR",
        );
        if (!scorerAthlete) continue;

        const assistAthlete = competitor.athletes?.find(
          (a) => a.pbpat_role === "ASSIST",
        );

        const scorer: Scorer = {
          team: teamLookup.get(competitor.pbpc_code) ?? competitor.pbpc_code,
          player:
            athleteLookup.get(scorerAthlete.pbpat_code) ??
            scorerAthlete.pbpat_code,
          minute: this.parseMinute(action.pbpa_When),
          type: this.inferGoalType(action.pbpa_Action),
        };

        if (assistAthlete) {
          scorer.assist =
            athleteLookup.get(assistAthlete.pbpat_code) ??
            assistAthlete.pbpat_code;
        }

        scorers.push(scorer);
      }
    }

    return scorers.sort((a, b) => a.minute - b.minute);
  }

  private parseMinute(when: string): number {
    const m = /^(\d+)'/.exec(when.trim());
    return m ? parseInt(m[1]!, 10) : 0;
  }

  private inferGoalType(pbpaAction: string): ScorerType {
    return pbpaAction === "PEN" ? "penalty" : "open_play";
  }

  private mapLineups(homeItem: Item, awayItem: Item): Lineups {
    return {
      home: this.mapLineup(homeItem),
      away: this.mapLineup(awayItem),
    };
  }

  private mapLineup(item: Item): TeamLineup {
    const formation =
      item.eventUnitEntries?.find((e) => e.eue_code === "FORMATION")
        ?.eue_value ?? "unknown";

    const headCoach = item.teamCoaches?.find(
      (c) => c.function.functionCode === "COACH",
    );
    const coach = headCoach
      ? `${headCoach.coach.givenName ?? ""} ${headCoach.coach.familyName ?? ""}`.trim()
      : "unknown";

    const startingXI: Player[] = [];
    const bench: Player[] = [];

    for (const ta of item.teamAthletes ?? []) {
      const isStarter = ta.eventUnitEntries?.some(
        (e) => e.eue_code === "STARTER" && e.eue_value === "Y",
      );
      const position =
        ta.eventUnitEntries?.find(
          (e) => e.eue_code === "POSITION" && e.eue_pos === "1",
        )?.eue_value ??
        ta.athlete.registeredEvents?.[0]?.eventEntries?.find(
          (e) => e.ee_code === "POSITION",
        )?.ee_value ??
        "UNK";

      const player: Player = {
        name: `${ta.athlete.givenName ?? ""} ${ta.athlete.familyName ?? ""}`.trim(),
        number: parseInt(ta.bib ?? "0", 10),
        position,
      };

      (isStarter ? startingXI : bench).push(player);
    }

    return { team: item.participant.name, formation, coach, startingXI, bench };
  }
}
