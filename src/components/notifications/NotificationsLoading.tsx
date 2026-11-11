import { useTranslation } from "react-i18next";

const rows = ["one", "two", "three", "four", "five", "six"];

export default function NotificationsLoading() {
  const { t } = useTranslation(["notifications", "common"]);

  return (
    <div className="flex flex-col items-start justify-start">
      <span className="sr-only">{t("common:loading")}</span>
      <div className="flex w-full items-center justify-between">
        <div className="bg-muted flex gap-1 rounded-full p-1">
          <div className="bg-muted-foreground/20 h-6 w-16 animate-pulse rounded-full" />
          <div className="bg-muted-foreground/20 h-6 w-20 animate-pulse rounded-full" />
        </div>
        <div className="bg-primary text-primary-foreground flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-full px-4 font-medium shadow-sm">
          {t("notifications:markAllRead")}
        </div>
      </div>
      <ul className="mt-2 grid w-full gap-2">
        {rows.map((row) => (
          <li
            key={row}
            className="flex items-center justify-between gap-2 py-3"
          >
            <div className="flex gap-2">
              <div className="bg-muted size-10 animate-pulse rounded-full" />
              <div className="grid gap-2">
                <div className="bg-muted h-[0.875rem] w-36 animate-pulse rounded-md" />
                <div className="bg-muted h-[0.875rem] w-24 animate-pulse rounded-md" />
                <div className="bg-muted block h-[0.75rem] w-14 animate-pulse rounded-md md:hidden" />
              </div>
            </div>
            <div className="bg-muted hidden h-[0.875rem] w-16 animate-pulse rounded-md md:block" />
          </li>
        ))}
      </ul>
    </div>
  );
}
