import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useNow } from "@/hooks/use-now";
import type { SessionUser } from "@/types/auth";
import { streamsForTopic } from "@/lib/stream-visibility";
import { useClickOutside } from "@/hooks/use-click-outside";
import type {
  Classroom,
  ClassTopic,
  EnrolledClass,
  Stream,
} from "@/lib/schema";

import StreamCard from "@/components/stream/StreamCard";
import TopicDialog from "@/components/stream/TopicDialog";
import EllipsisPopover from "@/components/shared/EllipsisPopover";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function TopicCard({
  topic,
  topics,
  classroom,
  user,
  classworks,
  enrolledClasses,
  onDeleteTopic,
  onDeleteStream,
  deleteTopicIsPending,
  deleteStreamIsPending,
}: {
  topic: ClassTopic;
  topics: ClassTopic[] | null;
  classroom: Classroom;
  user: SessionUser;
  classworks: Stream[] | null;
  enrolledClasses: EnrolledClass[] | null;
  onDeleteTopic: (topicId: string) => void;
  onDeleteStream: (streamId: string) => void;
  deleteTopicIsPending: boolean;
  deleteStreamIsPending: boolean;
}) {
  const { t } = useTranslation("classwork", { keyPrefix: "topic" });
  const now = useNow();

  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [ellipsis, setEllipsis] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isTeacher = user.id === classroom.teacherId;
  const topicStreams = streamsForTopic(
    classworks,
    topic.id,
    user.id,
    classroom.teacherId,
    now,
  );

  useClickOutside(ellipsisRef, () => setEllipsis(false), false);

  return (
    <li className="grid gap-2">
      <ul className="flex items-center justify-between">
        <li className="flex w-full items-center gap-2 font-semibold">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2"
            aria-label={expanded ? t("collapse") : t("expand")}
            onClick={() => {
              if (topicStreams.length) setExpanded((current) => !current);
            }}
          >
            {topicStreams.length ? (
              <ChevronDown
                strokeWidth={3}
                className={`${expanded ? "rotate-180" : "rotate-0"} w-5 transition-transform`}
              />
            ) : null}
            <h4 className="text-foreground text-base">{topic.name}</h4>
          </button>
        </li>
        <li>
          <ul className="flex items-center">
            {isTeacher && (
              <li>
                <div className="relative" ref={ellipsisRef}>
                  <button
                    type="button"
                    aria-label={t("menu")}
                    onClick={() => setEllipsis((current) => !current)}
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="mt-[2px] size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                      />
                    </svg>
                  </button>
                  <EllipsisPopover
                    showEdit={isTeacher}
                    showEllipsis={ellipsis}
                    showDelete={isTeacher}
                    onToggleEllipsis={() => setEllipsis((current) => !current)}
                    onShowEditForm={() => setShowTopicForm(true)}
                    onShowConfirmationModal={() => setShowConfirmation(true)}
                  />
                  {showConfirmation && (
                    <ConfirmationModal
                      type="delete"
                      btnLabel={t("delete")}
                      isLoading={deleteTopicIsPending}
                      handleCancel={() => setShowConfirmation(false)}
                      handleAction={() => {
                        setShowConfirmation(false);
                        onDeleteTopic(topic.id);
                      }}
                    >
                      {t("confirmDelete")}
                    </ConfirmationModal>
                  )}
                  {showTopicForm && (
                    <TopicDialog
                      type="edit"
                      topic={topic}
                      classroom={classroom}
                      onClose={() => setShowTopicForm(false)}
                    />
                  )}
                </div>
              </li>
            )}
          </ul>
        </li>
      </ul>
      {expanded && (
        <ul className="grid gap-2">
          {topicStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              classroom={classroom}
              topics={topics}
              enrolledClasses={enrolledClasses}
              user={user}
              showComments={false}
              onDeleteStream={onDeleteStream}
              deleteIsPending={deleteStreamIsPending}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
