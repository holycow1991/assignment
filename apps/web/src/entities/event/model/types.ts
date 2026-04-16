export interface EventListItem {
  externalId: string;
  genderCode: string;
  startDate: string;
  competitors: Array<{ name: string }>;
}

export interface EventListResponse {
  events: EventListItem[];
}