import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";

import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";

export const Route = createFileRoute("/_auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Sign up | ScholaFlow" },
      {
        name: "description",
        content:
          "Sign up and start learning! Access classes, assignments, and connect with classmates.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const { t } = useTranslation("auth", { keyPrefix: "signUp" });

  return (
    <AuthCard
      title={t("title")}
      footer={
        <p className="flex items-center justify-center gap-1 text-sm">
          {t("links.alreadyHaveAccount")}
          <Link to="/sign-in" className="font-medium hover:underline">
            {t("links.signIn")}
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
