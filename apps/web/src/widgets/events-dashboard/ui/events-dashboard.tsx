"use client";

import { EventsTable } from "../../../features/events-list/ui/events-table";
import { RefetchEventsButton } from "../../../features/refetch-events/ui/refetch-events-button";
import { useEventsList } from "../../../features/events-list/model/use-events-list";
import { useExportEventJson } from "../../../features/export-event-json/model/use-export-event-json";
import { useRefetchEvent } from "../../../features/refetch-event/model/use-refetch-event";
import { useRefetchEvents } from "../../../features/refetch-events/model/use-refetch-events";

export function EventsDashboard() {
  const eventsQuery = useEventsList();
  const refetchAllMutation = useRefetchEvents();
  const rowRefetchMutation = useRefetchEvent();
  const exportMutation = useExportEventJson();

  const events = eventsQuery.data?.events ?? [];

  return (
    <main className="page">
      <section className="hero">
        <span className="eyebrow"></span>
        <h1>Paris 2024</h1>
        <p>Football events dashboard</p>
      </section>

      <section className="panel">
        <div className="panel-inner">
          <div className="toolbar">
            <div>
              <h2>Events</h2>
              <p>
                {events.length > 0
                  ? `${events.length} football events available`
                  : "Load the current football schedule"}
              </p>
            </div>
            <div className="actions">
              <RefetchEventsButton
                isPending={refetchAllMutation.isPending}
                onClick={() => refetchAllMutation.mutate()}
              />
            </div>
          </div>

          {eventsQuery.isError && (
            <div className="status error">
              {(eventsQuery.error as Error).message}
            </div>
          )}

          {refetchAllMutation.isError && (
            <div className="status error">
              {(refetchAllMutation.error as Error).message}
            </div>
          )}

          {rowRefetchMutation.isError && (
            <div className="status error">
              {(rowRefetchMutation.error as Error).message}
            </div>
          )}

          {exportMutation.isError && (
            <div className="status error">
              {(exportMutation.error as Error).message}
            </div>
          )}

          <EventsTable
            events={events}
            isLoading={eventsQuery.isLoading}
            rowRefetchingId={
              rowRefetchMutation.isPending
                ? rowRefetchMutation.variables
                : undefined
            }
            exportingId={
              exportMutation.isPending
                ? exportMutation.variables?.externalId
                : undefined
            }
            onRefetchRow={(externalId) => rowRefetchMutation.mutate(externalId)}
            onExport={(event) => exportMutation.mutate(event)}
          />
        </div>
      </section>
    </main>
  );
}
