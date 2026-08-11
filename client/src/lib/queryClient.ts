import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/**
 * Thin fetch wrapper used across the app. FormData bodies are sent as-is (so the
 * browser sets the multipart boundary); plain objects are JSON-encoded.
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const init: RequestInit = {
    method,
    credentials: "include",
  };

  if (data !== undefined) {
    if (isFormData) {
      init.body = data as FormData;
    } else {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(data);
    }
  }

  return fetch(url, init);
}
