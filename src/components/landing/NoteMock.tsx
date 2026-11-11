import { useTranslation } from "react-i18next";

import CommentListMock from "@/components/landing/CommentListMock";

export default function NoteMock() {
  const { t } = useTranslation("landing", { keyPrefix: "mocks.note" });

  return (
    <>
      <div className="mt-3 ml-3 flex flex-col gap-1">
        <img
          src="/landing_page/notes-1-image.svg"
          width={150}
          height={150}
          className="w-[12rem] rounded-xl object-cover"
          alt={t("imageAlt")}
        />
        <p className="text-foreground/70 text-[0.7rem]">{t("created")}</p>
        <h6 className="text-foreground text-base font-medium">{t("title")}</h6>
      </div>
      <div className="mx-3 mt-2 grid gap-1">
        <p className="text-foreground/90 text-xs">{t("body")}</p>
      </div>
      <CommentListMock />
    </>
  );
}
