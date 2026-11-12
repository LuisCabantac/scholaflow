import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly, Link } from "@tanstack/react-router";

import { useNow } from "@/hooks/use-now";
import type { SessionUser } from "@/types/auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import { longDateTime, relativeDay, timeOfDay } from "@/lib/stream-dates";
import type {
  Classroom,
  ClassTopic,
  EnrolledClass,
  Stream,
} from "@/lib/schema";

import StreamForm from "@/components/stream/StreamForm";
import UserAvatar from "@/components/shared/UserAvatar";
import LinkifiedText from "@/components/stream/LinkifiedText";
import StreamComments from "@/components/stream/StreamComments";
import StreamTypeIcon from "@/components/stream/StreamTypeIcon";
import EllipsisPopover from "@/components/shared/EllipsisPopover";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";
import AttachmentLinkCard from "@/components/shared/AttachmentLinkCard";

export default function StreamCard({
  stream,
  classroom,
  topics,
  enrolledClasses,
  user,
  showComments = false,
  onDeleteStream,
  deleteIsPending,
}: {
  stream: Stream;
  classroom: Classroom;
  topics: ClassTopic[] | null;
  enrolledClasses: EnrolledClass[] | null;
  user: SessionUser;
  showComments?: boolean;
  onDeleteStream: (streamId: string) => void;
  deleteIsPending: boolean;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "card" });
  const now = useNow();

  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [ellipsis, setEllipsis] = useState(false);
  const [hasComments, setHasComments] = useState(false);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isScheduled =
    !!stream.scheduledAt && new Date(stream.scheduledAt) > now;
  const dayLabels = { today: t("today"), yesterday: t("yesterday") };
  const clipboardUrl = `/classroom/class/${classroom.id}/stream/${stream.id}`;

  function scheduledText(date: Date | string) {
    const day = relativeDay(date, dayLabels);
    if (day === dayLabels.today)
      return t("scheduledToday", { time: timeOfDay(date) });
    if (day === dayLabels.yesterday)
      return t("scheduledYesterday", { time: timeOfDay(date) });
    return t("scheduledAt", { date: longDateTime(date) });
  }

  useClickOutside(ellipsisRef, () => setEllipsis(false), false);

  const meta = (
    <ClientOnly fallback={<p className="text-foreground/70 h-4 text-xs" />}>
      <p className="text-foreground/70 flex flex-wrap items-center gap-1 text-xs">
        {t("posted", { when: relativeDay(stream.createdAt, dayLabels) })}
        {stream.updatedAt && (
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
          >
            <title>{t("edited")}</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        )}
        {isScheduled && stream.scheduledAt && (
          <span>• {scheduledText(stream.scheduledAt)}</span>
        )}
      </p>
    </ClientOnly>
  );

  return (
    <li className="bg-card flex w-full flex-col rounded-xl border p-3 shadow-sm md:p-4">
      <div
        className={`relative ${hasComments && showComments ? "border-b pb-3" : ""}`}
      >
        {stream.type === "stream" && (
          <div>
            <Link
              to="/classroom/class/$classId/stream/$streamId"
              params={{ classId: classroom.id, streamId: stream.id }}
            >
              <div className="flex gap-2 pb-2">
                <UserAvatar
                  src={stream.userImage}
                  alt={t("imageAlt", { name: stream.userName })}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full"
                />
                <div className="min-w-0 pr-8">
                  <p className="font-medium [overflow-wrap:anywhere]">
                    {stream.userName}
                  </p>
                  {meta}
                </div>
              </div>
            </Link>
            <LinkifiedText>
              <p className="text-foreground/90 hidden whitespace-pre-line [overflow-wrap:anywhere] md:block">
                {stream.content}
              </p>
              <p className="text-foreground/90 block whitespace-pre-line [overflow-wrap:anywhere] md:hidden">
                {stream.content && stream.content.length > 80
                  ? stream.content.slice(0, 80).concat("...")
                  : stream.content}
                {stream.content && stream.content.length > 80 && (
                  <span className="text-foreground hover:underline">
                    <Link
                      to="/classroom/class/$classId/stream/$streamId"
                      params={{ classId: classroom.id, streamId: stream.id }}
                    >
                      {" "}
                      {t("seeMore")}
                    </Link>
                  </span>
                )}
              </p>
            </LinkifiedText>
            {stream.attachments.length || stream.links.length ? (
              <div className="mt-2 grid gap-2">
                <p className="font-medium">{t("attachments")}</p>
                <ul className="grid gap-1 font-medium">
                  {stream.attachments.map((file, index) => (
                    <AttachmentFileCard
                      file={file}
                      index={index}
                      type="curFile"
                      location="stream"
                      key={file}
                    />
                  ))}
                  {stream.links.map((url, index) => (
                    <AttachmentLinkCard
                      key={url}
                      link={url}
                      index={index}
                      location="stream"
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        {stream.type !== "stream" && (
          <div>
            <Link
              to="/classroom/class/$classId/stream/$streamId"
              params={{ classId: classroom.id, streamId: stream.id }}
              className="group flex gap-2"
            >
              <StreamTypeIcon type={stream.type} />
              <div className="min-w-0">
                <p className="pr-8 font-medium [overflow-wrap:anywhere] group-hover:underline">
                  {stream.title}
                </p>
                {meta}
              </div>
            </Link>
          </div>
        )}
        <div className="absolute top-0 right-0">
          <div className="relative" ref={ellipsisRef}>
            <button
              onClick={() => setEllipsis(!ellipsis)}
              type="button"
              aria-label={t("menu")}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </button>
            <EllipsisPopover
              showEdit={user.id === stream.userId}
              clipboardUrl={clipboardUrl}
              showEllipsis={ellipsis}
              showDelete={
                user.id === stream.userId || user.id === classroom.teacherId
              }
              onToggleEllipsis={() => setEllipsis(!ellipsis)}
              onShowEditForm={() => setShowStreamForm(true)}
              onShowConfirmationModal={() => setShowConfirmation(true)}
            />
            {showConfirmation && (
              <ConfirmationModal
                type="delete"
                btnLabel={t("delete")}
                isLoading={deleteIsPending}
                handleCancel={() => setShowConfirmation(false)}
                handleAction={() => {
                  setShowConfirmation(false);
                  onDeleteStream(stream.id);
                }}
              >
                {t("confirmDelete")}
              </ConfirmationModal>
            )}
          </div>
        </div>
      </div>
      {showComments && (
        <StreamComments
          stream={stream}
          classroom={classroom}
          user={user}
          onHasComments={setHasComments}
        />
      )}
      {showStreamForm && (
        <StreamForm
          formType="edit"
          streamType={stream.type}
          stream={stream}
          topics={topics}
          classroom={classroom}
          enrolledClasses={enrolledClasses}
          user={user}
          onClose={() => setShowStreamForm(false)}
        />
      )}
    </li>
  );
}
