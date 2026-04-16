import type { Match } from "@assignment/types";

export interface EventListItem {
  externalId: string;
  genderCode: string;
  startDate: string;
  competitors: Array<{ name: string }>;
}

export interface EventListResponse {
  events: EventListItem[];
}

interface ApiErrorResponse {
  message?: string | string[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function getApiEventUrl(id: string): string {
  return `${API_BASE_URL}/events/${id}`;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`;

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (Array.isArray(payload.message)) {
        message = payload.message.join(", ");
      }
    } catch {
      // Keep fallback message when body parsing fails.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getEvents(): Promise<EventListResponse> {
  return request<EventListResponse>("/events");
}

export function refetchEvents(): Promise<EventListResponse> {
  return request<EventListResponse>("/events/refetch");
}

export function getEventById(id: string): Promise<Match> {
  return request<Match>(`/events/${id}`);
}

export function refetchEventById(id: string): Promise<Match> {
  return request<Match>(`/events/refetch/${id}`);
}
