import { useTranslation } from "react-i18next";

export default function NoNotifications() {
  const { t } = useTranslation("notifications", { keyPrefix: "empty" });

  return (
    <li className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <img
          src="/app/no_notifications.svg"
          alt={t("imageAlt")}
          className="object-cover select-none"
        />
      </div>
      <p className="font-medium md:text-lg">{t("message")}</p>
    </li>
  );
}
