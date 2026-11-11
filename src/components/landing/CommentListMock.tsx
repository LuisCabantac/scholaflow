import { useTranslation } from "react-i18next";

import MockAvatar from "@/components/landing/MockAvatar";

export default function CommentListMock() {
  const { t } = useTranslation("landing", { keyPrefix: "mocks" });

  return (
    <>
      <div className="mt-2 ml-3 flex items-start gap-2 pr-3">
        <MockAvatar file="comment-2-avatar.jpg" name={t("people.zachariah")} />
        <div>
          <p className="mb-0.5 text-xs font-medium">{t("people.zachariah")}</p>
          <p className="text-xs">{t("comments.question")}</p>
        </div>
      </div>
      <div className="mt-2 ml-3 flex items-start gap-2">
        <MockAvatar file="comment-avatar.jpg" name={t("people.elissa")} />
        <div>
          <p className="mb-0.5 text-xs font-medium">{t("people.elissa")}</p>
          <p className="text-xs">{t("comments.related")}</p>
          <img
            src="/landing_page/comment-1-image.jpg"
            width={150}
            height={150}
            className="mt-1 w-[10rem] rounded-xl object-cover"
            alt={t("comments.imageAlt")}
          />
        </div>
      </div>
      <div className="mt-2 ml-3 flex items-start gap-2">
        <MockAvatar file="comment-3-avatar.jpg" name={t("people.lori")} />
        <div>
          <p className="mb-0.5 text-xs font-medium">{t("people.lori")}</p>
          <p className="text-xs">{t("comments.visual")}</p>
        </div>
      </div>
    </>
  );
}
