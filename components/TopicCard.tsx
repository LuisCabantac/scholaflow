"use client";

import { useRef, useState } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";

import TopicForm, { ITopic } from "@/components/TopicForm";
import ClassStreamCard from "@/components/ClassStreamCard";
import { IClass } from "@/components/ClassroomSection";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import EllipsisPopover from "@/components/EllipsisPopover";

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
  topic: ITopic;
  topics: ITopic[] | null | undefined;
  session: ISession;
  classroom: IClass;
  classworks: IStream[] | null | undefined;
  onDeleteTopic: (topicId: string) => void;
  enrolledClasses: IClass[] | null;
  onGetAllComments: (streamId: string) => Promise<IStreamComment[] | null>;
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
          ((stream.announceTo.includes(session.user.id) &&
            stream.announceToAll === false) ||
            stream.announceToAll ||
            stream.author === session.user.id ||
            classroom.teacherId === session.user.id) &&
          stream.topicId === topic.topicId,
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
              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
            />
          </svg>
          <h4>{topic.topicName}</h4>
        </li>
        <li>
          <ul className="flex items-center">
            {classworks?.filter(
              (stream) =>
                ((stream.announceTo.includes(session.user.id) &&
                  stream.announceToAll === false) ||
                  stream.announceToAll ||
                  stream.author === session.user.id ||
                  classroom.teacherId === session.user.id) &&
                stream.topicId === topic.topicId,
            ).length ? (
              <li onClick={handleToggleExpandTopic}>
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
              </li>
            ) : null}
            {session.user.id === classroom.teacherId && (
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
                    showEdit={session.user.id === classroom.teacherId}
                    showEllipsis={ellipsis}
                    showDelete={session.user.id === classroom.teacherId}
                    onToggleEllipsis={handleToggleEllipsis}
                    onShowEditForm={handleToggleShowTopicForm}
                    onShowConfirmationScreen={handleToggleShowConfirmation}
                  />
                  {showConfirmation && (
                    <ConfirmationScreen
                      type="delete"
                      btnLabel="Delete"
                      isLoading={deleteTopicIsPending}
                      handleCancel={handleToggleShowConfirmation}
                      handleAction={() => {
                        handleToggleShowConfirmation();
                        onDeleteTopic(topic.topicId);
                      }}
                    >
                      Are you sure you want to delete this post?
                    </ConfirmationScreen>
                  )}
                  {showTopicForm && (
                    <TopicForm
                      type="edit"
                      topic={topic}
                      classroom={classroom}
                      onSetShowTopicForm={setShowTopicForm}
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
                ((stream.announceTo.includes(session.user.id) &&
                  stream.announceToAll === false) ||
                  stream.announceToAll ||
                  stream.author === session.user.id ||
                  classroom.teacherId === session.user.id) &&
                stream.topicId === topic.topicId,
            )
            .map((stream) => (
              <ClassStreamCard
                key={stream.id}
                topics={topics as ITopic[] | null}
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
