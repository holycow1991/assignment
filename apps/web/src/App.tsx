import type { GeneratedEndpoint } from "@assignment/types";
import { useState } from "react";

type LoadState = "idle" | "loading" | "error";

export default function App() {
  const [results, setResults] = useState<GeneratedEndpoint[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLoad() {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/matches/endpoints");
      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`,
        );
      }
      const data: GeneratedEndpoint[] =
        (await response.json()) as GeneratedEndpoint[];
      setResults(data);
      setLoadState("idle");
    } catch (err) {
      setLoadState("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "paris-2024-endpoints.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>Paris 2024 — Olympic Football Endpoint Generator</h1>
      <p>
        Generate expected API endpoints for every football match in the Paris
        2024 Olympic Games schedule.
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button onClick={handleLoad} disabled={loadState === "loading"}>
          {loadState === "loading" ? "Loading…" : "Load & Generate Endpoints"}
        </button>
        {results.length > 0 && (
          <button onClick={handleExport}>
            Export JSON ({results.length} matches)
          </button>
        )}
      </div>

      {loadState === "error" && errorMessage && (
        <p role="alert" style={{ color: "red" }}>
          Error: {errorMessage}
        </p>
      )}

      {loadState === "idle" && results.length === 0 && (
        <p>No data yet. Click "Load & Generate Endpoints" to begin.</p>
      )}

      {results.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Kickoff (UTC)</th>
              <th style={thStyle}>Home</th>
              <th style={thStyle}>Away</th>
              <th style={thStyle}>Venue</th>
              <th style={thStyle}>Generated Endpoint</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr
                key={i}
                style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff" }}
              >
                <td style={tdStyle}>{row.match.kickoff}</td>
                <td style={tdStyle}>{row.match.teams.home}</td>
                <td style={tdStyle}>{row.match.teams.away}</td>
                <td style={tdStyle}>{row.match.venue.city}</td>
                <td
                  style={{
                    ...tdStyle,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {row.endpoint}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};
