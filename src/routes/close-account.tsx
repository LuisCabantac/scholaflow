import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { uuidv4Id } from "@/lib/schema";

import AuthCard from "@/components/auth/AuthCard";
import CloseAccountSection from "@/components/auth/CloseAccountSection";

export const Route = createFileRoute("/close-account")({
  validateSearch: z.object({ token: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (!search.token || !uuidv4Id.safeParse(search.token).success) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Close Account | ScholaFlow" },
      {
        name: "description",
        content:
          "Close your ScholaFlow account permanently and delete all associated data.",
      },
    ],
  }),
  component: CloseAccount,
});

function CloseAccount() {
  const { t } = useTranslation("auth", { keyPrefix: "closeAccount" });
  const { token } = Route.useSearch();

  return (
    <AuthCard title={t("title")}>
      <CloseAccountSection token={token ?? ""} />
    </AuthCard>
  );
}
