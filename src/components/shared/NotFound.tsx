import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation("common", { keyPrefix: "notFound" });

  return (
    <div className="mx-4 grid min-h-screen place-items-center md:mx-8">
      <div className="flex h-[30rem] flex-col items-center justify-center gap-2 md:gap-3">
        <div className="relative w-[15rem] md:w-[20rem]">
          <img
            src="/app/page-not-found.svg"
            alt={t("imageAlt")}
            className="object-cover select-none"
          />
        </div>
        <p className="mb-2 text-center text-base font-medium">{t("message")}</p>
        <Button asChild>
          <Link to="/">{t("goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
