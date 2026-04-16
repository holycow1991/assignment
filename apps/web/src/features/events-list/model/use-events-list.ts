import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../../../entities/event/api/events";

export function useEventsList() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
}
