import { useRef, useState } from "react";
import Image from "next/image";
import ReactLinkify from "react-linkify";

import { formatDate } from "@/lib/utils";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import {
  Classroom,
  Session,
  Stream,
  StreamComment,
  StreamPrivateComment,
} from "@/lib/schema";

import EllipsisPopover from "@/components/EllipsisPopover";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function CommentCard({
  stream,
  comment,
  session,
  classroom,
  onDeleteComment,
  deleteCommentIsPending,
}: {
  stream: Stream;
  comment: StreamComment | StreamPrivateComment;
  session: Session;
  classroom: Classroom;
  onDeleteComment: (
    classroomId: string,
    streamId: string,
    commentId: string,
  ) => void;
  deleteCommentIsPending: boolean;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const commentEllipsisWrapperRef = useRef<HTMLDivElement>(null);
  const zoomedImageWrapperRef = useRef(null);
  const [commentEllipsis, setCommentEllipsis] = useState(false);
  const [showCommentConfirmation, setShowCommentConfirmation] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  function openZoomedImage(imageUrl: string) {
    setZoomedImage(imageUrl);
  }

  function closeZoomedImage() {
    setZoomedImage(null);
  }

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

  useClickOutsideHandler(
    zoomedImageWrapperRef,
    () => {
      setZoomedImage(null);
    },
    false,
  );

  function captionLinksDecorator(href: string, text: string, key: number) {
    return (
      <a
        href={href}
        key={key}
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-wrap break-words break-all text-primary underline"
      >
        {text}
      </a>
    );
  }

  return (
    <li
      key={comment.id}
      className="relative flex items-center justify-between break-all"
    >
      <div className="grid grid-cols-[2rem_1fr] gap-2">
        <Image
          src={comment.userImage}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
          alt={`${comment.userName}'s image`}
        />
        <div>
          <div className="flex items-center gap-1">
            <h6 className="text-sm font-medium text-foreground">
              {comment.userName}
            </h6>
            <p className="pt-[1px] text-xs text-foreground/70">
              {formatDate(comment.createdAt)}
            </p>
          </div>
          {comment.content && (
            <ReactLinkify componentDecorator={captionLinksDecorator}>
              <p className="mr-[1rem] whitespace-pre-line text-foreground/90">
                {comment.content}
              </p>
            </ReactLinkify>
          )}
          {comment.attachments.length ? (
            <ul className="mt-1 grid gap-1">
              {comment.attachments.map((image) => (
                <li
                  key={image}
                  onClick={() => openZoomedImage(image)}
                  className="cursor-pointer"
                >
                  <Image
                    src={image}
                    alt={image}
                    width={250}
                    height={250}
                    className="w-[10rem] rounded-md object-cover md:w-[15rem]"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      {(session.id === comment.userId ||
        session.id === classroom.teacherId) && (
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
                session.id === comment.userId ||
                session.id === classroom.teacherId
              }
              onToggleEllipsis={handleToggleCommentEllipsis}
              showEllipsis={commentEllipsis}
              onShowConfirmationModal={handleToggleShowCommentConfirmation}
            />
            {showCommentConfirmation && (
              <ConfirmationModal
                type="delete"
                btnLabel="Delete"
                isLoading={deleteCommentIsPending}
                handleCancel={handleToggleShowCommentConfirmation}
                handleAction={() => {
                  onDeleteComment(classroom.id, stream.id, comment.id);
                  handleToggleShowCommentConfirmation();
                }}
              >
                Are you sure you want to delete this comment?
              </ConfirmationModal>
            )}
          </div>
        </div>
      )}
      {zoomedImage && (
        <div className="modal__container">
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={closeZoomedImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="flex max-h-full max-w-full items-center justify-center"
            ref={zoomedImageWrapperRef}
          >
            <Image
              src={zoomedImage}
              alt={zoomedImage}
              width={500}
              height={500}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </li>
  );
}
