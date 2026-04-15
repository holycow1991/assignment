import {
  Competition,
  Lineups,
  Match,
  MatchStatus,
  Score,
  Scorer,
  Teams,
  Venue,
} from "@assignment/types";

export class MatchResponseDto {
  competition: Competition;
  venue: Venue;
  kickoff: string;
  status: MatchStatus;
  teams: Teams;
  score: Score;
  scorers: Scorer[];
  lineups: Lineups;

  constructor(data: Match) {
    this.competition = data.competition;
    this.venue = data.venue;
    this.kickoff = data.kickoff;
    this.status = data.status;
    this.teams = data.teams;
    this.score = data.score;
    this.scorers = data.scorers;
    this.lineups = data.lineups;
  }
}
