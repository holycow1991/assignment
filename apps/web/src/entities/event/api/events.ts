import type { Match } from "@assignment/types";
import { API_BASE_URL, request } from "../../../shared/api/client";
import type { EventListResponse } from "../model/types";

export function getApiEventUrl(id: string): string {
  return `${API_BASE_URL}/events/${id}`;
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
