import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

import ChatMock from "@/components/landing/ChatMock";
import NoteMock from "@/components/landing/NoteMock";
import CommentsMock from "@/components/landing/CommentsMock";
import FeatureBlock from "@/components/landing/FeatureBlock";
import FeaturePreview from "@/components/landing/FeaturePreview";
import ClassStreamMock from "@/components/landing/ClassStreamMock";

export default function FeaturesSection({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation("landing", { keyPrefix: "features" });

  return (
    <section
      ref={sectionRef}
      className="mb-24 grid gap-16 pt-12 md:mx-10 md:gap-24 lg:mx-24"
    >
      <div className="grid w-full grid-cols-1 items-start gap-x-12 gap-y-4 md:gap-y-24">
        <FeatureBlock
          eyebrow={t("feedback.eyebrow")}
          title={t("feedback.title")}
          description={t("feedback.description")}
          delay={0.2}
          preview={(className) => (
            <FeaturePreview className={className}>
              <CommentsMock />
            </FeaturePreview>
          )}
        />
        <FeatureBlock
          eyebrow={t("chat.eyebrow")}
          title={t("chat.title")}
          description={t("chat.description")}
          delay={0.4}
          previewFirst
          preview={(className) => (
            <FeaturePreview className={className} innerClassName="pr-3">
              <ChatMock />
            </FeaturePreview>
          )}
        />
        <FeatureBlock
          eyebrow={t("notes.eyebrow")}
          title={t("notes.title")}
          description={t("notes.description")}
          delay={0.6}
          preview={(className) => (
            <FeaturePreview className={className}>
              <NoteMock />
            </FeaturePreview>
          )}
        />
        <FeatureBlock
          eyebrow={t("classroom.eyebrow")}
          title={t("classroom.title")}
          description={t("classroom.description")}
          delay={0.8}
          previewFirst
          className="pt-16"
          preview={(className) => (
            <FeaturePreview className={className} innerClassName="px-3 py-3">
              <ClassStreamMock />
            </FeaturePreview>
          )}
        />
      </div>
    </section>
  );
}
