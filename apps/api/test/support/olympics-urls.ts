export function getOlympicsScheduleDates(): string[] {
  const dates: string[] = [];
  const current = new Date("2024-07-24");
  const end = new Date("2024-08-11");

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function getScheduleUrl(date: string): string {
  return `${process.env.OLYMPICS_BASE_URL}/srm/data/oly/schedule/day/ENG/${date}.json`;
}

export function getEventDetailsUrl(sourceEventId: string): string {
  return `${process.env.OLYMPICS_BASE_URL}/OG2024/data/RES_ByRSC_H2H~comp=OG2024~disc=FBL~rscResult=${sourceEventId}~lang=ENG.json`;
}
