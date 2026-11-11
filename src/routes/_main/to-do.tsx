import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/to-do")({
  validateSearch: z.object({
    filter: z.enum(["assigned", "missing", "done"]).optional(),
  }),
  component: () => null,
});
