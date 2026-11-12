import { useTranslation } from "react-i18next";

export default function CommentsLoading() {
  const { t } = useTranslation("common");

  return (
    <li className="flex gap-2" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
      <div className="grid gap-2">
        <div className="bg-muted h-[0.875rem] w-20 animate-pulse rounded-md" />
        <div className="bg-muted h-[0.875rem] w-28 animate-pulse rounded-md" />
      </div>
    </li>
  );
}
