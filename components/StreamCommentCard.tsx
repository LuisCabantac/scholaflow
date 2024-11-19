import { useRef, useState } from "react";
import Image from "next/image";

import { formatDate } from "@/lib/utils";
import { ISession } from "@/lib/auth";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { IClass } from "@/components/ClassroomSection";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import EllipsisPopover from "@/components/EllipsisPopover";

export default function StreamCommentCard({
  stream,
  comment,
  session,
  classroom,
  onDeleteComment,
  deleteCommentIsPending,
}: {
  stream: IStream;
  comment: IStreamComment;
  session: ISession;
  classroom: IClass;
  onDeleteComment: (
    classroomId: string,
    streamId: string,
    commentId: string,
  ) => void;
  deleteCommentIsPending: boolean;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const commentEllipsisWrapperRef = useRef<HTMLDivElement>(null);
  const [commentEllipsis, setCommentEllipsis] = useState(false);
  const [showCommentConfirmation, setShowCommentConfirmation] = useState(false);

  function handleToggleCommentEllipsis() {
    setCommentEllipsis(!commentEllipsis);
  }

  function handleToggleShowCommentConfirmation() {
    setShowCommentConfirmation(!showCommentConfirmation);
  }

  useClickOutsideHandler(
    commentEllipsisWrapperRef,
    () => {
      setCommentEllipsis(false);
    },
    false,
  );

  return (
    <li
      key={comment.id}
      className="relative flex items-center justify-between break-all"
    >
      <div className="grid grid-cols-[1.6rem_1fr] gap-4">
        <div className="relative h-8 w-8 rounded-full">
          <Image
            src={comment.authorAvatar}
            fill
            className="rounded-full"
            alt={`${comment.authorName}'s image`}
          />
        </div>
        <div>
          <h6 className="text-sm font-medium">{comment.authorName}</h6>
          <p className="whitespace-pre-line">{comment.comment}</p>
          <p className="text-[0.65rem] text-[#616572]">
            {formatDate(comment.created_at)}
          </p>
        </div>
      </div>
      {(session.user.id === comment.author ||
        session.user.id === classroom.teacherId) && (
        <div className="absolute right-0 top-0">
          <div className="relative" ref={commentEllipsisWrapperRef}>
            <button onClick={handleToggleCommentEllipsis} type="button">
              <svg
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
              showDelete={
                session.user.id === comment.author ||
                session.user.id === classroom.teacherId
              }
              onToggleEllipsis={handleToggleCommentEllipsis}
              showEllipsis={commentEllipsis}
              onShowConfirmationScreen={handleToggleShowCommentConfirmation}
            />
            {showCommentConfirmation && (
              <ConfirmationScreen
                type="delete"
                btnLabel="Delete"
                isLoading={deleteCommentIsPending}
                handleCancel={handleToggleShowCommentConfirmation}
                handleAction={() => {
                  onDeleteComment(classroom.classroomId, stream.id, comment.id);
                  handleToggleShowCommentConfirmation();
                }}
              >
                Are you sure you want to delete this comment?
              </ConfirmationScreen>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
