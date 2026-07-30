import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * Minimal URL search-param helper for TanStack Router (this project's
 * version has no `useSearchParams` hook). Reads the current location's
 * search params and returns a setter that merges updates into the URL.
 */
export function useUrlSearchParams() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  const params = new URLSearchParams(searchStr ?? "");

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchStr ?? "");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      // navigate with a raw search string via to
      const qs = next.toString();
      navigate({ to: pathname, search: qs ? Object.fromEntries(next.entries()) : {} });
    },
    [navigate, pathname, searchStr],
  );

  return { params, setParams };
}
