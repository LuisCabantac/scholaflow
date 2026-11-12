import { useTranslation } from "react-i18next";

export default function ProfileLoading() {
  const { t } = useTranslation(["profile", "common"]);

  return (
    <output className="grid gap-4">
      <span className="sr-only">{t("common:loading")}</span>
      <div className="mx-auto">
        <div className="flex flex-col items-center gap-y-4">
          <div className="bg-muted h-16 w-16 animate-pulse rounded-full md:h-24 md:w-24" />
          <div className="bg-muted h-7 w-40 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-28 animate-pulse rounded-full" />
        </div>
      </div>
      <div>
        <div className="bg-muted mb-4 h-7 w-56 animate-pulse rounded-md" />
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-card flex flex-col rounded-xl border p-4 shadow-sm">
              <h4 className="text-foreground/70 text-xs font-semibold">
                {t("info.email")}
              </h4>
              <div className="bg-muted mt-1 h-5 w-full animate-pulse rounded-md" />
            </div>
            <div className="bg-card flex flex-col rounded-xl border p-4 shadow-sm">
              <h4 className="text-foreground/70 text-xs font-semibold">
                {t("info.school")}
              </h4>
              <div className="bg-muted mt-1 h-5 w-full animate-pulse rounded-md" />
            </div>
            <div className="bg-card flex flex-col rounded-xl border p-4 shadow-sm">
              <h4 className="text-foreground/70 text-xs font-semibold">
                {t("info.joined")}
              </h4>
              <div className="bg-muted mt-1 h-5 w-full animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border p-0 shadow-sm md:p-3">
        <div className="p-4 pb-2">
          <div className="bg-muted h-6 w-36 animate-pulse rounded-md" />
        </div>
        <div className="p-4">
          <div className="flex flex-col items-start gap-y-3 md:flex-row md:items-center md:justify-between">
            <div className="bg-muted h-4 w-full max-w-md animate-pulse rounded-md" />
            <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    </output>
  );
}
