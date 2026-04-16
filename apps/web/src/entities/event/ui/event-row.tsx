import type { EventListItem } from "../model/types";
import { getApiEventUrl } from "../api/events";
import { formatDateTime } from "../../../shared/lib/format-date-time";
import { ExportEventJsonButton } from "../../../features/export-event-json/ui/export-event-json-button";
import { RefetchEventButton } from "../../../features/refetch-event/ui/refetch-event-button";

interface EventRowProps {
  event: EventListItem;
  isRefetching: boolean;
  isExporting: boolean;
  onRefetch: (externalId: string) => void;
  onExport: (event: EventListItem) => void;
}

export function EventRow({
  event,
  isRefetching,
  isExporting,
  onRefetch,
  onExport,
}: EventRowProps) {
  return (
    <tr>
      <td>{formatDateTime(event.startDate)}</td>
      <td>
        <div className="teams">
          <strong>{event.competitors[0]?.name ?? "TBD"}</strong>
          <span className="muted">vs</span>
          <strong>{event.competitors[1]?.name ?? "TBD"}</strong>
        </div>
      </td>
      <td>{event.genderCode === "M" ? "Men" : "Women"}</td>
      <td>
        <a
          className="id-link"
          href={getApiEventUrl(event.externalId)}
          target="_blank"
          rel="noreferrer"
        >
          {event.externalId}
        </a>
      </td>
      <td>
        <div className="row-actions">
          <RefetchEventButton
            isPending={isRefetching}
            onClick={() => onRefetch(event.externalId)}
          />
          <ExportEventJsonButton
            isPending={isExporting}
            onClick={() => onExport(event)}
          />
        </div>
      </td>
    </tr>
  );
}
