import { useMutation } from "@tanstack/react-query";
import { getEventById } from "../../../entities/event/api/events";
import type { EventListItem } from "../../../entities/event/model/types";
import { downloadJson } from "../../../shared/lib/download-json";

export function useExportEventJson() {
  return useMutation({
    mutationFn: async (event: EventListItem) => {
      const match = await getEventById(event.externalId);
      downloadJson(`${event.externalId}.json`, match);
      return event.externalId;
    },
  });
}
