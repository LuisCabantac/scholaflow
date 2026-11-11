import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import type { SessionUser } from "@/types/auth";
import { capitalizeFirstLetter } from "@/lib/utils";
import type { Classroom, Stream } from "@/lib/schema";
import { classworkQueries } from "@/queries/classwork";

import GradeDialog from "@/components/classwork/GradeDialog";
import PrivateComments from "@/components/stream/PrivateComments";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";
import AttachmentLinkCard from "@/components/shared/AttachmentLinkCard";

export default function SubmissionDetail({
  stream,
  classroom,
  user,
  selectedUserId,
  selectedName,
  expanded,
  onClose,
}: {
  stream: Stream;
  classroom: Classroom;
  user: SessionUser;
  selectedUserId: string | undefined;
  selectedName: string | undefined;
  expanded: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation("classwork", { keyPrefix: "submissions" });
  const [showGrade, setShowGrade] = useState(false);

  const { data: work } = useQuery({
    ...classworkQueries.byStreamAndUser(
      selectedUserId ?? "",
      stream.classId,
      stream.id,
    ),
    enabled: !!selectedUserId,
  });

  return (
    <div
      className={`bg-card fixed right-0 bottom-0 left-0 h-full overflow-y-scroll p-3 md:static md:h-auto md:rounded-xl md:border md:p-4 ${selectedUserId && expanded ? "z-10 block" : "hidden"} ${selectedUserId ? "md:block" : "md:hidden"}`}
    >
      <div className="relative min-h-screen pb-[6rem] md:min-h-0 md:pb-0">
        <button
          type="button"
          className="disabled:cursor-not-allowed md:hidden"
          aria-label={t("close")}
          onClick={onClose}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
        {stream.points && selectedUserId ? (
          <button
            type="button"
            className="absolute top-[2.1rem] right-[0.15rem] md:top-1 md:right-0"
            aria-label={t("addGrade")}
            onClick={() => setShowGrade(true)}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        ) : null}
        {showGrade && selectedUserId && (
          <GradeDialog
            stream={stream}
            classroom={classroom}
            userId={selectedUserId}
            classwork={work}
            onClose={() => setShowGrade(false)}
          />
        )}
        {work ? (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">{work.userName}</p>
              {stream.points && (
                <p className="pr-6">
                  {work.points} / {stream.points}
                </p>
              )}
            </div>
            {work.attachments.length || work.links.length ? (
              <div className="grid gap-2">
                <span className="font-medium">{t("attachments")}</span>
                <ul className="grid max-h-full gap-1 overflow-y-auto md:max-h-44">
                  {work.attachments.map((file, index) => (
                    <AttachmentFileCard
                      file={file}
                      index={index}
                      type="curFile"
                      location="form"
                      isLoading={false}
                      key={file}
                    />
                  ))}
                  {work.links.map((link, index) => (
                    <AttachmentLinkCard
                      link={link}
                      index={index}
                      location="form"
                      isLoading={false}
                      key={link}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <p>{t("noAttachments")}</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-lg font-medium">
              {capitalizeFirstLetter(selectedName?.split("-").join(" ") ?? "")}
            </p>
            <p>{t("noAttachments")}</p>
          </>
        )}
        {selectedUserId && (
          <PrivateComments
            variant="submissions"
            stream={stream}
            classroom={classroom}
            user={user}
            otherUserId={selectedUserId}
            classworkId={work?.id}
          />
        )}
      </div>
    </div>
  );
}
