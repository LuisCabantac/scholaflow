import { queryOptions } from "@tanstack/react-query";

import { getSession } from "@/server/functions/auth";

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export const authQueries = {
  session: () =>
    queryOptions({
      queryKey: authKeys.session(),
      queryFn: () => getSession(),
      staleTime: 60_000,
    }),
};
