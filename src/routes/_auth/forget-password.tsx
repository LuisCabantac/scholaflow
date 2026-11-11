import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";

import { pageHead } from "@/lib/seo";

import AuthCard from "@/components/auth/AuthCard";
import ForgetPasswordForm from "@/components/auth/ForgetPasswordForm";

export const Route = createFileRoute("/_auth/forget-password")({
  head: () =>
    pageHead({
      title: "Forgot Password | ScholaFlow",
      description:
        "Reset your password to regain access to your ScholaFlow account.",
      path: "/forget-password",
      index: false,
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
