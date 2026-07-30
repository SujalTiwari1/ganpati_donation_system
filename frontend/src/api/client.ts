import axios, { AxiosError, type AxiosInstance } from "axios";
import { API_BASE_URL, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/constants";
import type { ApiEnvelope } from "@/types/api";

export interface ApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string[]>;
  isNetworkError?: boolean;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export const UNAUTHORIZED_EVENT = "vargani:unauthorized";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toApiError(error: AxiosError<ApiEnvelope<unknown> & { errors?: Record<string, string[]> }>) {
  const parsed: ApiError = new Error("Something went wrong. Please try again.");

  if (!error.response) {
    parsed.message =
      error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please retry."
        : "Network error — unable to reach the server.";
    parsed.isNetworkError = true;
    return parsed;
  }

  const { status, data } = error.response;
  parsed.status = status;
  parsed.message = data?.message || defaultMessageForStatus(status);
  parsed.fieldErrors = data?.errors;
  return parsed;
}

function defaultMessageForStatus(status: number) {
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This record conflicts with an existing entry.";
    case 422:
      return "Validation failed. Please check the highlighted fields.";
    default:
      return status >= 500 ? "Server error. Please try again shortly." : "Request failed.";
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const parsed = toApiError(error);
    if (parsed.status === 401 && typeof window !== "undefined") {
      clearSession();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(parsed);
  },
);

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}