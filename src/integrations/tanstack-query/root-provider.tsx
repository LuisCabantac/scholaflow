import { QueryClient } from "@tanstack/react-query";

export type RouterContext = ReturnType<typeof getContext>;

export function getContext() {
  const queryClient = new QueryClient();

  return {
    queryClient,
  };
}
