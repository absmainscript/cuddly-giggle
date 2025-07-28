import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnMount: false, // Prevent auto refetch on mount
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      refetchOnReconnect: false, // Prevent refetch on reconnect
      retry: 1, // Reduce retry attempts
    },
    mutations: {
      retry: 1, // Reduce mutation retry attempts
    },
  },
});