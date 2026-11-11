import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import AuthCard from "@/components/auth/AuthCard";
import ForgetPasswordForm from "@/components/auth/ForgetPasswordForm";

export const Route = createFileRoute("/_auth/forget-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password | ScholaFlow" },
      {
        name: "description",
        content:
          "Reset your password to regain access to your ScholaFlow account.",
      },
    ],
  }),
  component: ForgetPassword,
});

function ForgetPassword() {
  const { t } = useTranslation("auth", { keyPrefix: "forgetPassword" });

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
      <ForgetPasswordForm />
    </AuthCard>
  );
}
