import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { uuidv4Id } from "@/lib/schema";

import AuthCard from "@/components/auth/AuthCard";
import VerifySection from "@/components/auth/VerifySection";

export const Route = createFileRoute("/_auth/verify")({
  validateSearch: z.object({ token: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (!search.token || !uuidv4Id.safeParse(search.token).success) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Verify Email | ScholaFlow" },
      {
        name: "description",
        content:
          "Verify your email address to complete your account setup and access your classroom.",
      },
    ],
  }),
  component: Verify,
});

function Verify() {
  const { t } = useTranslation("auth", { keyPrefix: "verify" });
  const { token } = Route.useSearch();

  return (
    <AuthCard title={t("title")}>
      <VerifySection token={token ?? ""} />
    </AuthCard>
  );
}
