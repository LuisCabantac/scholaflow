import { useLoaderData } from "@tanstack/react-router";

import { useHydrated } from "@/hooks/use-hydrated";

export function useNow() {
  const { renderedAt } = useLoaderData({ from: "/_main" });
  const hydrated = useHydrated();

  return hydrated ? new Date() : new Date(renderedAt);
}
