"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EventListItem,
  getApiEventUrl,
  getEventById,
  getEvents,
  refetchEventById,
  refetchEvents,
} from "../lib/api";

export function EventsTable() {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const refetchAllMutation = useMutation({
    mutationFn: refetchEvents,
    onSuccess: (data) => {
      queryClient.setQueryData(["events"], data);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const rowRefetchMutation = useMutation({
    mutationFn: async (id: string) => {
      const match = await refetchEventById(id);
      return { id, match };
    },
    onSuccess: ({ id, match }) => {
      queryClient.setQueryData(["event", id], match);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (event: EventListItem) => {
      const match = await getEventById(event.externalId);
      downloadJson(`${event.externalId}.json`, match);
      return event.externalId;
    },
  });

  const events = eventsQuery.data?.events ?? [];

  return (
    <main className="page">
      <section className="hero">
        <span className="eyebrow">Next.js + TanStack Query</span>
        <h1>Olympic football events at a glance.</h1>
        <p>
          Browse the cached event list, open raw backend responses, refetch the
          complete schedule, or refresh and export one event at a time through
          the Nest API.
        </p>
      </section>

      <section className="panel">
        <div className="panel-inner">
          <div className="toolbar">
            <div>
              <h2>Events</h2>
              <p>
                {events.length > 0
                  ? `${events.length} football events available from the backend cache.`
                  : "Load the current football schedule from the backend."}
              </p>
            </div>
            <div className="actions">
              <button
                className="button secondary"
                onClick={() => eventsQuery.refetch()}
                disabled={eventsQuery.isFetching}
              >
                {eventsQuery.isFetching ? "Refreshing view..." : "Reload table"}
              </button>
              <button
                className="button"
                onClick={() => refetchAllMutation.mutate()}
                disabled={refetchAllMutation.isPending}
              >
                {refetchAllMutation.isPending
                  ? "Refetching all..."
                  : "Refetch everything"}
              </button>
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
                {eventsQuery.isLoading ? (
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
                  events.map((event) => {
                    const isRefetchingRow =
                      rowRefetchMutation.isPending &&
                      rowRefetchMutation.variables === event.externalId;
                    const isExportingRow =
                      exportMutation.isPending &&
                      exportMutation.variables?.externalId === event.externalId;

                    return (
                      <tr key={event.externalId}>
                        <td>{formatDateTime(event.startDate)}</td>
                        <td>
                          <div className="teams">
                            <strong>
                              {event.competitors[0]?.name ?? "TBD"}
                            </strong>
                            <span className="muted">vs</span>
                            <strong>
                              {event.competitors[1]?.name ?? "TBD"}
                            </strong>
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
                            <button
                              className="button ghost"
                              onClick={() =>
                                rowRefetchMutation.mutate(event.externalId)
                              }
                              disabled={isRefetchingRow}
                            >
                              {isRefetchingRow
                                ? "Refetching..."
                                : "Refetch row"}
                            </button>
                            <button
                              className="button secondary"
                              onClick={() => exportMutation.mutate(event)}
                              disabled={isExportingRow}
                            >
                              {isExportingRow ? "Exporting..." : "Export JSON"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="export-note">
            The external id opens the raw backend response in a new tab. JSON
            export downloads the payload from the same `/api/events/:id`
            endpoint.
          </p>
        </div>
      </section>
    </main>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
