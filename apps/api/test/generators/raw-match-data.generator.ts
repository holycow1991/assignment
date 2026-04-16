import type { RawMatchData } from "../../src/events/event.types";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export function buildRawMatchData(
  overrides: DeepPartial<RawMatchData> = {},
): RawMatchData {
  const base: RawMatchData = {
    results: {
      eventUnit: {
        description: "Group Stage",
      },
      extendedInfos: [
        {
          ei_code: "PERIOD",
          ei_value: "FT",
        },
      ],
      periods: [
        {
          p_code: "H1",
          home: { score: "1" },
          away: { score: "0" },
        },
        {
          p_code: "TOT",
          home: { score: "2" },
          away: { score: "1" },
        },
      ],
      schedule: {
        startDate: "2024-07-24T17:00:00.000Z",
        venue: {
          description: "Parc des Princes",
        },
        location: {
          longDescription: "Paris",
        },
      },
      items: [
        {
          teamCode: "TEAM-HOME",
          participant: { name: "France" },
          eventUnitEntries: [
            { eue_code: "HOME_AWAY", eue_value: "HOME" },
            { eue_code: "FORMATION", eue_value: "4-3-3" },
          ],
          teamAthletes: [
            {
              bib: "9",
              athlete: {
                code: "HOME-9",
                givenName: "Alice",
                familyName: "Striker",
                registeredEvents: [
                  {
                    eventEntries: [{ ee_code: "POSITION", ee_value: "FW" }],
                  },
                ],
              },
              eventUnitEntries: [
                { eue_code: "STARTER", eue_value: "Y" },
                { eue_code: "POSITION", eue_value: "FW", eue_pos: "1" },
              ],
            },
            {
              bib: "10",
              athlete: {
                code: "HOME-10",
                givenName: "Jamie",
                familyName: "Playmaker",
                registeredEvents: [
                  {
                    eventEntries: [{ ee_code: "POSITION", ee_value: "MF" }],
                  },
                ],
              },
              eventUnitEntries: [
                { eue_code: "STARTER", eue_value: "N" },
                { eue_code: "POSITION", eue_value: "MF", eue_pos: "1" },
              ],
            },
          ],
          teamCoaches: [
            {
              function: { functionCode: "COACH" },
              coach: { givenName: "Thierry", familyName: "Coach" },
            },
          ],
        },
        {
          teamCode: "TEAM-AWAY",
          participant: { name: "United States" },
          eventUnitEntries: [
            { eue_code: "HOME_AWAY", eue_value: "AWAY" },
            { eue_code: "FORMATION", eue_value: "4-4-2" },
          ],
          teamAthletes: [
            {
              bib: "4",
              athlete: {
                code: "AWAY-4",
                givenName: "Taylor",
                familyName: "Defender",
                registeredEvents: [
                  {
                    eventEntries: [{ ee_code: "POSITION", ee_value: "DF" }],
                  },
                ],
              },
              eventUnitEntries: [
                { eue_code: "STARTER", eue_value: "Y" },
                { eue_code: "POSITION", eue_value: "DF", eue_pos: "1" },
              ],
            },
          ],
          teamCoaches: [
            {
              function: { functionCode: "COACH" },
              coach: { givenName: "Emma", familyName: "Manager" },
            },
          ],
        },
      ],
      playByPlay: [
        {
          subcode: "H1",
          actions: [
            {
              pbpa_Action: "SHOT",
              pbpa_Result: "GOAL",
              pbpa_When: "12'",
              competitors: [
                {
                  pbpc_code: "TEAM-HOME",
                  athletes: [
                    {
                      pbpat_code: "HOME-9",
                      pbpat_role: "SCR",
                    },
                    {
                      pbpat_code: "HOME-10",
                      pbpat_role: "ASSIST",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };

  return {
    ...base,
    ...overrides,
    results: mergeResults(base.results, overrides.results),
  };
}

function mergeResults(
  base: RawMatchData["results"],
  overrides?: DeepPartial<RawMatchData["results"]>,
): RawMatchData["results"] {
  if (!overrides) {
    return base;
  }

  const merged = {
    ...base,
    ...overrides,
    eventUnit: {
      ...base.eventUnit,
      ...overrides.eventUnit,
    },
    schedule: {
      ...base.schedule,
      ...overrides.schedule,
    },
    extendedInfos: overrides.extendedInfos
      ? (overrides.extendedInfos as RawMatchData["results"]["extendedInfos"])
      : base.extendedInfos,
    periods: overrides.periods
      ? (overrides.periods as RawMatchData["results"]["periods"])
      : base.periods,
    items: overrides.items
      ? (overrides.items as RawMatchData["results"]["items"])
      : base.items,
  };

  const playByPlay = overrides.playByPlay ?? base.playByPlay;

  if (playByPlay) {
    return {
      ...merged,
      playByPlay,
    } as RawMatchData["results"];
  }

  return merged as RawMatchData["results"];
}
