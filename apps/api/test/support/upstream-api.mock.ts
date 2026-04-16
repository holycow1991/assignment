import { jest } from "@jest/globals";

type MockRoute =
  | {
      type: "json";
      body: unknown;
      status: number;
      statusText: string;
    }
  | {
      type: "network-error";
      error: Error;
    };

export interface UpstreamApiMock {
  fetchMock: jest.MockedFunction<typeof fetch>;
  mockJsonResponse(url: string, body: unknown, status?: number): void;
  mockNetworkError(url: string, error?: Error): void;
  restore(): void;
}

export function installUpstreamApiMock(): UpstreamApiMock {
  const originalFetch = global.fetch;
  const routes = new Map<string, MockRoute>();

  const fetchMock = jest.fn(async (input: string | URL | Request) => {
    const url = resolveRequestUrl(input);
    const route = routes.get(url);

    if (!route) {
      throw new Error(`Unexpected upstream request: ${url}`);
    }

    if (route.type === "network-error") {
      throw route.error;
    }

    return {
      ok: route.status >= 200 && route.status < 300,
      status: route.status,
      statusText: route.statusText,
      json: async () => route.body,
    } as Response;
  }) as jest.MockedFunction<typeof fetch>;

  global.fetch = fetchMock;

  return {
    fetchMock,
    mockJsonResponse(url: string, body: unknown, status = 200): void {
      routes.set(url, {
        type: "json",
        body,
        status,
        statusText: status === 200 ? "OK" : "Mocked Error",
      });
    },
    mockNetworkError(url: string, error = new Error("Mocked network error")) {
      routes.set(url, {
        type: "network-error",
        error,
      });
    },
    restore(): void {
      global.fetch = originalFetch;
    },
  };
}

function resolveRequestUrl(input: string | URL | Request): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}
