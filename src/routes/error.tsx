import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";
import { CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/error")({
  head: () => ({
    meta: [
      { title: "Something went wrong | ScholaFlow" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ErrorPage,
});

function ErrorPage() {
  const { t } = useTranslation("auth", { keyPrefix: "error" });

  return (
    <AuthCard title={t("title")}>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-center">
          {t("description")}
        </p>
        <Button asChild className="w-full">
          <Link to="/">{t("goHome")}</Link>
        </Button>
      </CardContent>
    </AuthCard>
  );
}
