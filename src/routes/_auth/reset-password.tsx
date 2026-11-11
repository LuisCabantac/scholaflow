import { z } from "zod";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { nanoidId } from "@/lib/schema";

import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: z.object({ token: z.string().optional() }),
  beforeLoad: ({ search }) => {
    if (!search.token || !nanoidId.safeParse(search.token).success) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Reset Password | ScholaFlow" },
      {
        name: "description",
        content:
          "Reset your password to regain access to your ScholaFlow account.",
      },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useTranslation("auth", { keyPrefix: "resetPassword" });
  const { token } = Route.useSearch();

  return (
    <AuthCard
      title={t("title")}
      footer={
        <p className="flex items-center justify-center gap-1 text-sm">
          {t("links.dontHaveAccount")}
          <Link to="/sign-up" className="font-medium hover:underline">
            {t("links.signUp")}
          </Link>
        </p>
      }
    >
      <ResetPasswordForm token={token ?? ""} />
    </AuthCard>
  );
}
