"use client";

import { useRef, useState } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import {
  Classroom,
  ClassTopic,
  EnrolledClass,
  Session,
  Stream,
  StreamComment,
} from "@/lib/schema";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import StreamCard from "@/components/StreamCard";
import TopicDialog from "@/components/TopicDialog";
import EllipsisPopover from "@/components/EllipsisPopover";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function TopicCard({
  topic,
  topics,
  session,
  classroom,
  classworks,
  onDeleteTopic,
  enrolledClasses,
  onGetAllComments,
  onDeleteStreamPost,
  deleteTopicIsPending,
  deleteStreamPostIsPending,
}: {
  topic: ClassTopic;
  topics: ClassTopic[] | null;
  session: Session;
  classroom: Classroom;
  classworks: Stream[] | null;
  onDeleteTopic: (topicId: string) => void;
  enrolledClasses: EnrolledClass[] | null;
  onGetAllComments: (streamId: string) => Promise<StreamComment[] | null>;
  onDeleteStreamPost: UseMutateFunction<undefined, Error, string, unknown>;
  deleteTopicIsPending: boolean;
  deleteStreamPostIsPending: boolean;
}) {
  const ellipsisWrapperRef = useRef<HTMLDivElement>(null);
  const { useClickOutsideHandler } = useClickOutside();
  const [expandTopic, setExpandTopic] = useState(false);
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);

  function handleToggleExpandTopic() {
    if (
      classworks?.filter(
        (stream) =>
          ((stream.announceTo.includes(session.id) &&
            stream.announceToAll === false) ||
            stream.announceToAll ||
            stream.userId === session.id ||
            classroom.teacherId === session.id) &&
          stream.topicId === topic.id,
      ).length
    )
      setExpandTopic(!expandTopic);
  }

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  function handleToggleShowTopicForm() {
    setShowTopicForm(!showTopicForm);
  }

  useClickOutsideHandler(
    ellipsisWrapperRef,
    () => {
      setEllipsis(false);
    },
    false,
  );

  return (
    <li className="grid gap-2">
      <ul className="flex items-center justify-between">
        <li
          className="flex w-full cursor-pointer items-center gap-2 font-semibold"
          onClick={handleToggleExpandTopic}
        >
          {classworks?.filter(
            (stream) =>
              ((stream.announceTo.includes(session.id) &&
                stream.announceToAll === false) ||
                stream.announceToAll ||
                stream.userId === session.id ||
                classroom.teacherId === session.id) &&
              stream.topicId === topic.id,
          ).length ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className={`${expandTopic ? "rotate-180" : "rotate-0"} size-5 cursor-pointer transition-transform`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          ) : null}
          <h4 className="text-base">{topic.name}</h4>
        </li>
        <li>
          <ul className="flex items-center">
            {session.id === classroom.teacherId && (
              <li>
                <div className="relative" ref={ellipsisWrapperRef}>
                  <button onClick={handleToggleEllipsis} type="button">
                    <svg
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
                    showEdit={session.id === classroom.teacherId}
                    showEllipsis={ellipsis}
                    showDelete={session.id === classroom.teacherId}
                    onToggleEllipsis={handleToggleEllipsis}
                    onShowEditForm={handleToggleShowTopicForm}
                    onShowConfirmationModal={handleToggleShowConfirmation}
                  />
                  {showConfirmation && (
                    <ConfirmationModal
                      type="delete"
                      btnLabel="Delete"
                      isLoading={deleteTopicIsPending}
                      handleCancel={handleToggleShowConfirmation}
                      handleAction={() => {
                        handleToggleShowConfirmation();
                        onDeleteTopic(topic.id);
                      }}
                    >
                      Are you sure you want to delete this post?
                    </ConfirmationModal>
                  )}
                  {showTopicForm && (
                    <TopicDialog
                      type="edit"
                      topic={topic}
                      classroom={classroom}
                      onSetShowTopicDialog={setShowTopicForm}
                      onToggleShowTopic={handleToggleShowTopicForm}
                    />
                  )}
                </div>
              </li>
            )}
          </ul>
        </li>
      </ul>
      {expandTopic && (
        <ul className="grid gap-2">
          {classworks
            ?.filter(
              (stream) =>
                ((stream.announceTo.includes(session.id) &&
                  stream.announceToAll === false) ||
                  stream.announceToAll ||
                  stream.userId === session.id ||
                  classroom.teacherId === session.id) &&
                stream.topicId === topic.id &&
                ((stream.scheduledAt
                  ? new Date(stream.scheduledAt) < new Date()
                  : true) ||
                  classroom.teacherId === session.id),
            )
            .map((stream) => (
              <StreamCard
                key={stream.id}
                topics={topics as ClassTopic[] | null}
                stream={stream}
                classroom={classroom}
                session={session}
                showComments={false}
                enrolledClasses={enrolledClasses}
                deleteStreamPostIsPending={deleteStreamPostIsPending}
                onDeleteStreamPost={onDeleteStreamPost}
                onGetAllComments={onGetAllComments}
              />
            ))}
        </ul>
      )}
    </li>
  );
}
