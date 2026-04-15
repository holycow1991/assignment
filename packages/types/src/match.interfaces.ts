export interface Competition {
  name: string;
  season: string;
  round: string;
}

export interface Venue {
  name: string;
  city: string;
}

export interface Teams {
  home: string;
  away: string;
}

export interface HalfTimeScore {
  home: number;
  away: number;
}

export interface Score {
  home: number;
  away: number;
  halfTime: HalfTimeScore;
}

export type ScorerType =
  | "open_play"
  | "header"
  | "penalty"
  | "free_kick"
  | "own_goal";

export interface Scorer {
  team: string;
  player: string;
  minute: number;
  assist?: string;
  type: ScorerType;
}

export interface Player {
  name: string;
  number: number;
  position: string;
}

export interface TeamLineup {
  team: string;
  formation: string;
  coach: string;
  startingXI: Player[];
  bench: Player[];
}

export interface Lineups {
  home: TeamLineup;
  away: TeamLineup;
}

/** Status values aligned with common football data APIs */
export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "HT"
  | "FT"
  | "AET"
  | "PEN"
  | "POSTPONED"
  | "CANCELLED";

export interface Match {
  competition: Competition;
  venue: Venue;
  kickoff: string;
  status: MatchStatus;
  teams: Teams;
  score: Score;
  scorers: Scorer[];
  lineups: Lineups;
}

export interface MatchSummary {
  competition: Competition;
  venue: Venue;
  kickoff: string;
  status: MatchStatus;
  teams: Teams;
}

export interface GeneratedEndpoint {
  match: MatchSummary;
  endpoint: string;
}
