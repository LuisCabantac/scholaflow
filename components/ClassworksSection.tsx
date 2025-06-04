"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useOptimistic, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import noClasworks from "@/public/app/no_classworks.svg";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { deleteClassStreamPost, deleteTopic } from "@/lib/classroom-actions";
import {
  Classroom,
  ClassTopic,
  Session,
  StreamComment,
  Stream,
  EnrolledClass,
  Classwork,
} from "@/lib/schema";

import StreamCard from "@/components/StreamCard";
import Button from "@/components/Button";
import StreamForm from "@/components/StreamForm";
import TopicDialog, { ITopic } from "@/components/TopicDialog";
import TopicCard from "@/components/TopicCard";

type IStreamType = "stream" | "assignment" | "quiz" | "question" | "material";

export default function ClassworksSection({
  session,
  classroom,
  onGetAllTopics,
  enrolledClasses,
  onGetAllComments,
  onGetAllClassworkStreams,
}: {
  session: Session;
  classroom: Classroom;
  enrolledClasses: EnrolledClass[] | null;
  onGetAllTopics: (classId: string) => Promise<ClassTopic[] | null>;
  onGetAllComments: (streamId: string) => Promise<StreamComment[] | null>;
  onGetAllClassworkStreams: (
    classId: string,
    query: string,
  ) => Promise<Stream[] | null>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const btnWrapperRef = useRef<HTMLDivElement>(null);
  const [classworkType, setClassworkType] = useState<IStreamType>("stream");
  const [search, setSearch] = useState("");
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showCreateClasswork, setShowCreateClasswork] = useState(false);

  const { data: classworks, isPending: classworksIsPending } = useQuery({
    queryKey: [`classworks--${classroom.id}`, search],
    queryFn: () => onGetAllClassworkStreams(classroom.id, search),
  });

  const { mutate: deleteStreamPost, isPending: deleteStreamPostIsPending } =
    useMutation({
      mutationFn: deleteClassStreamPost,
      onSuccess: () => {
        toast.success("Classwork has been successfully deleted!");

        queryClient.invalidateQueries({
          queryKey: [
            `classworks--${classroom.id}`,
            `topics--${classroom.id}`,
            search,
          ],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { data: topics } = useQuery({
    queryKey: [`topics--${classroom.id}`],
    queryFn: () => onGetAllTopics(classroom.id),
  });

  const { mutate: deleteClassTopic, isPending: deleteTopicIsPending } =
    useMutation({
      mutationFn: deleteTopic,
      onSuccess: () => {
        toast.success("Topic has been successfully deleted!");

        queryClient.invalidateQueries({
          queryKey: [`topics--${classroom.id}`, `classworks--${classroom.id}`],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const [optimisticClassworks, optimisticDeleteClassworks] = useOptimistic(
    classworks,
    (curClass, streamId) => {
      return curClass?.filter((stream) => stream.id !== streamId);
    },
  );

  const [optimisticTopics, optimisticDeleteTopics] = useOptimistic(
    topics,
    (curTopic, topicId) => {
      return curTopic?.filter((topic) => topic.id !== topicId);
    },
  );

  function handleToggleShowStreamForm() {
    setShowStreamForm(!showStreamForm);
  }

  function handleToggleShowCreateClasswork() {
    setShowCreateClasswork(!showCreateClasswork);
  }

  function handleToggleShowTopicForm() {
    setShowTopicForm(!showTopicForm);
  }

  function handleSetClassworkType(type: IStreamType) {
    setClassworkType(type);
    handleToggleShowStreamForm();
  }

  function handleDeleteClassworkStream(streamId: string) {
    optimisticDeleteClassworks(streamId);
    deleteStreamPost(streamId);
  }

  function handleDeleteTopic(topicId: string) {
    optimisticDeleteTopics(topicId);
    deleteClassTopic(topicId);
  }

  useClickOutsideHandler(
    btnWrapperRef,
    () => {
      setShowCreateClasswork(false);
    },
    false,
  );

  return (
    <section>
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
          <Link
            href={`/classroom/class/${classroom.id}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Stream
          </Link>
          <Link
            href={`/classroom/class/${classroom.id}/classwork`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            Classwork
          </Link>
          <Link
            href={`/classroom/class/${classroom.id}/people`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            People
          </Link>
          <Link
            href={`/classroom/class/${classroom.id}/chat`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Chat
          </Link>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          {session.id === classroom.teacherId && (
            <input
              type="search"
              className="w-[60%] rounded-md border border-[#dddfe6] bg-[#eef3ff] px-4 py-2 shadow-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:w-[50%]"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {session.id === classroom.teacherId && (
            <div className="relative" ref={btnWrapperRef}>
              <Button type="primary" onClick={handleToggleShowCreateClasswork}>
                Create
              </Button>
              <div
                className={`${showCreateClasswork ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-0 z-20 grid w-[10rem] rounded-md bg-[#f3f6ff] p-2 font-medium shadow-md transition-all ease-in-out`}
              >
                <button
                  className="flex items-center rounded-md p-2 hover:text-[#242628]"
                  onClick={() => {
                    handleSetClassworkType("assignment");
                    handleToggleShowCreateClasswork();
                  }}
                >
                  Assignment
                </button>
                <button
                  className="flex items-center rounded-md p-2 hover:text-[#242628]"
                  onClick={() => {
                    handleSetClassworkType("quiz");
                    handleToggleShowCreateClasswork();
                  }}
                >
                  Quiz
                </button>
                <button
                  className="flex items-center rounded-md p-2 hover:text-[#242628]"
                  onClick={() => {
                    handleSetClassworkType("material");
                    handleToggleShowCreateClasswork();
                  }}
                >
                  Material
                </button>
                <button
                  className="flex items-center rounded-md p-2 hover:text-[#242628]"
                  onClick={() => {
                    handleToggleShowTopicForm();
                    handleToggleShowCreateClasswork();
                  }}
                >
                  Topic
                </button>
              </div>
            </div>
          )}
          {session.id !== classroom.teacherId && (
            <input
              type="search"
              className="w-full rounded-md border border-[#dddfe6] bg-[#eef3ff] bg-transparent px-4 py-2 shadow-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:w-[50%]"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
        </div>
        <div className="grid items-start gap-2">
          <div className="mt-2">
            <ul className="flex flex-col gap-2">
              {classworksIsPending && (
                <>
                  {Array(6)
                    .fill(undefined)
                    .map((_, index) => (
                      <li
                        key={index}
                        className="flex gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
                        role="status"
                      >
                        <span className="sr-only">Loading…</span>
                        <div className="size-8 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                        <div className="grid gap-2">
                          <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                          <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                        </div>
                      </li>
                    ))}
                </>
              )}
              {!optimisticClassworks?.filter(
                (stream) =>
                  ((stream.announceTo.includes(session.id) &&
                    stream.announceToAll === false) ||
                    stream.announceToAll ||
                    stream.userId === session.id ||
                    classroom.teacherId === session.id) &&
                  !stream.topicId &&
                  ((stream.scheduledAt
                    ? new Date(stream.scheduledAt) < new Date()
                    : true) ||
                    classroom.teacherId === session.id),
              ).length &&
              !optimisticTopics?.length &&
              !classworksIsPending ? (
                <li className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
                  <div className="relative w-[15rem] md:w-[20rem]">
                    <Image
                      src={noClasworks}
                      alt="no classworks"
                      className="object-cover"
                    />
                  </div>
                  <p className="font-medium md:text-lg">
                    Nothing to do for class yet!
                  </p>
                </li>
              ) : (
                optimisticClassworks
                  ?.filter(
                    (stream) =>
                      ((stream.announceTo.includes(session.id) &&
                        stream.announceToAll === false) ||
                        stream.announceToAll ||
                        stream.userId === session.id ||
                        classroom.teacherId === session.id) &&
                      !stream.topicId &&
                      ((stream.scheduledAt
                        ? new Date(stream.scheduledAt) < new Date()
                        : true) ||
                        classroom.teacherId === session.id),
                  )
                  .map((stream) => (
                    <StreamCard
                      key={stream.id}
                      search={search}
                      topics={topics as ClassTopic[] | null}
                      stream={stream}
                      session={session}
                      classroom={classroom}
                      showComments={false}
                      enrolledClasses={enrolledClasses}
                      deleteStreamPostIsPending={deleteStreamPostIsPending}
                      onDeleteStreamPost={handleDeleteClassworkStream}
                      onGetAllComments={onGetAllComments}
                    />
                  ))
              )}
              {optimisticTopics?.length ? (
                <li
                  className={`mt-1 ${optimisticClassworks?.length ? "border-t border-[#dddfe6] pt-2" : ""}`}
                >
                  <ul className="grid gap-4">
                    {optimisticTopics.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        topics={topics as ClassTopic[] | null}
                        session={session}
                        classroom={classroom}
                        classworks={classworks as Classwork[] | null}
                        enrolledClasses={enrolledClasses}
                        onGetAllComments={onGetAllComments}
                        onDeleteTopic={handleDeleteTopic}
                        onDeleteStreamPost={handleDeleteClassworkStream}
                        deleteTopicIsPending={deleteTopicIsPending}
                        deleteStreamPostIsPending={deleteStreamPostIsPending}
                      />
                    ))}
                  </ul>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
      {showStreamForm && (
        <StreamForm
          topics={topics as ITopic[] | null}
          session={session}
          search={search}
          formType="create"
          classroom={classroom}
          streamType={classworkType}
          enrolledClasses={enrolledClasses}
          onSetShowStreamForm={setShowStreamForm}
          onToggleShowStreamForm={handleToggleShowStreamForm}
        />
      )}
      {showTopicForm && (
        <TopicDialog
          type="create"
          classroom={classroom}
          onToggleShowTopic={handleToggleShowTopicForm}
          onSetShowTopicDialog={setShowTopicForm}
        />
      )}
    </section>
  );
}
