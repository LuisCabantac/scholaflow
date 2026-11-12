import { useTranslation } from "react-i18next";

export default function NoClassStreams() {
  const { t } = useTranslation("stream", { keyPrefix: "empty" });

  return (
    <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[20rem] md:gap-2">
      <div className="relative w-[10rem] md:w-[15rem]">
        <img
          src="/app/no_streams.svg"
          alt={t("imageAlt")}
          className="object-cover select-none"
        />
      </div>
      <p className="text-center text-base font-medium">{t("message")}</p>
    </div>
  );
}
