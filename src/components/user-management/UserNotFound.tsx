import { useTranslation } from "react-i18next";

export default function UserNotFound() {
  const { t } = useTranslation("userManagement", { keyPrefix: "notFound" });

  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
      <div className="relative w-[15rem] md:w-[20rem]">
        <img
          src="/app/no_user.svg"
          alt={t("imageAlt")}
          className="object-cover"
        />
      </div>
      <p className="text-base font-medium">{t("message")}</p>
    </div>
  );
}
