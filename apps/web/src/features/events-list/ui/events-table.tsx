import type { EventListItem } from "../../../entities/event/model/types";
import { EventRow } from "../../../entities/event/ui/event-row";

interface EventsTableProps {
  events: EventListItem[];
  isLoading: boolean;
  rowRefetchingId: string | undefined;
  exportingId: string | undefined;
  onRefetchRow: (externalId: string) => void;
  onExport: (event: EventListItem) => void;
}

export function EventsTable({
  events,
  isLoading,
  rowRefetchingId,
  exportingId,
  onRefetchRow,
  onExport,
}: EventsTableProps) {
  return (
    <div className="table-wrap">
      <table className="events-table">
        <thead>
          <tr>
            <th>Kickoff</th>
            <th>Fixture</th>
            <th>Category</th>
            <th>External id</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="empty">
                Loading events from the API...
              </td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                No football events were returned.
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <EventRow
                key={event.externalId}
                event={event}
                isRefetching={rowRefetchingId === event.externalId}
                isExporting={exportingId === event.externalId}
                onRefetch={onRefetchRow}
                onExport={onExport}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
