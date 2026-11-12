import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import type { SessionUser } from "@/types/auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import type {
  Classroom,
  Stream,
  StreamComment,
  StreamPrivateComment,
} from "@/lib/schema";

import UserAvatar from "@/components/shared/UserAvatar";
import ZoomedImage from "@/components/stream/ZoomedImage";
import LinkifiedText from "@/components/stream/LinkifiedText";
import EllipsisPopover from "@/components/shared/EllipsisPopover";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function CommentCard({
  stream,
  comment,
  user,
  classroom,
  onDeleteComment,
  deleteCommentIsPending,
}: {
  stream: Stream;
  comment: StreamComment | StreamPrivateComment;
  user: SessionUser;
  classroom: Classroom;
  onDeleteComment: (
    classroomId: string,
    streamId: string,
    commentId: string,
  ) => void;
  deleteCommentIsPending: boolean;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "comment" });
  const now = useNow();
  const { t: tCard } = useTranslation("stream", { keyPrefix: "card" });

  const ellipsisRef = useRef<HTMLDivElement>(null);

  const [ellipsis, setEllipsis] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canDelete =
    user.id === comment.userId || user.id === classroom.teacherId;

  useClickOutside(ellipsisRef, () => setEllipsis(false), false);

  return (
    <li className="relative flex items-center justify-between break-all">
      <div className="grid grid-cols-[2rem_1fr] gap-2">
        <UserAvatar
          src={comment.userImage}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
          alt={tCard("avatarAlt", { name: comment.userName })}
        />
        <div>
          <div className="flex items-center gap-1">
            <h6 className="text-foreground text-sm font-medium">
              {comment.userName}
            </h6>
            <p className="text-foreground/70 pt-[1px] text-xs">
              {formatDate(comment.createdAt, now)}
            </p>
          </div>
          {comment.content && (
            <LinkifiedText>
              <p className="text-foreground/90 mr-[1rem] whitespace-pre-line">
                {comment.content}
              </p>
            </LinkifiedText>
          )}
          {comment.attachment ? (
            <ul className="mt-1 grid gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => setZoomedImage(comment.attachment)}
                >
                  <img
                    src={comment.attachment}
                    alt={comment.attachment}
                    width={250}
                    height={250}
                    className="w-[10rem] rounded-md object-cover md:w-[15rem]"
                  />
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
      {canDelete && (
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
              showEdit={false}
              showDelete={canDelete}
              onToggleEllipsis={() => setEllipsis(!ellipsis)}
              showEllipsis={ellipsis}
              onShowConfirmationModal={() => setShowConfirmation(true)}
            />
            {showConfirmation && (
              <ConfirmationModal
                type="delete"
                btnLabel={t("delete")}
                isLoading={deleteCommentIsPending}
                handleCancel={() => setShowConfirmation(false)}
                handleAction={() => {
                  onDeleteComment(classroom.id, stream.id, comment.id);
                  setShowConfirmation(false);
                }}
              >
                {t("confirmDelete")}
              </ConfirmationModal>
            )}
          </div>
        </div>
      )}
      {zoomedImage && (
        <ZoomedImage src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </li>
  );
}
