"use client";

import { useOptimistic, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import noClasworks from "@/public/app/no_classworks.svg";
import { deleteClassStreamPost } from "@/lib/classroom-actions";
import { ISession } from "@/lib/auth";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { IClass } from "@/components/ClassroomSection";
import ClassStreamCard from "@/components/ClassStreamCard";
import Button from "@/components/Button";
import StreamForm from "@/components/StreamForm";

type IStreamType = "stream" | "assignment" | "quiz" | "question" | "material";

export default function ClassworksSection({
  classId,
  classroom,
  session,
  enrolledClasses,
  onGetAllComments,
  onGetAllClassworkStreams,
}: {
  classId: string;
  classroom: IClass;
  session: ISession;
  enrolledClasses: IClass[] | null;
  onGetAllComments: (streamId: string) => Promise<IStreamComment[] | null>;
  onGetAllClassworkStreams: (
    classId: string,
    query: string,
  ) => Promise<IStream[] | null>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const btnWrapperRef = useRef<HTMLDivElement>(null);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [showCreateClasswork, setShowCreateClasswork] = useState(false);
  const [classworkType, setClassworkType] = useState<IStreamType>("stream");
  const [search, setSearch] = useState("");

  const { data: classworks, isPending: classworksIsPending } = useQuery({
    queryKey: [`streams--${classroom.classroomId}`, search],
    queryFn: () => onGetAllClassworkStreams(classroom.classroomId, search),
  });

  const { mutate: deleteStreamPost, isPending: deleteStreamPostIsPending } =
    useMutation({
      mutationFn: deleteClassStreamPost,
      onSuccess: () => {
        toast.success("Post has been successfully deleted!");

        queryClient.invalidateQueries({
          queryKey: [`streams--${classroom.classroomId}`],
        });
      },
      onError: (error) => toast.error(error.message),
    });

  const [optimisticClassworks, optimisticDeleteClassworks] = useOptimistic(
    classworks,
    (curClass, streamId) => {
      return curClass?.filter((stream) => stream.id !== streamId);
    },
  );

  function handleToggleShowStreamForm() {
    setShowStreamForm(!showStreamForm);
  }

  function handleToggleShowCreateClasswork() {
    setShowCreateClasswork(!showCreateClasswork);
  }

  function handleSetClassworkType(type: IStreamType) {
    setClassworkType(type);
    handleToggleShowStreamForm();
  }

  function handleDeleteClassworkStream(streamId: string) {
    optimisticDeleteClassworks(streamId);
    deleteStreamPost(streamId);
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
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 text-sm font-medium shadow-sm md:text-base">
          <Link
            href={`/user/classroom/class/${classId}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Stream
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/classwork`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            Classwork
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/people`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            People
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/chat`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Chat
          </Link>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          {session.user.id === classroom.teacherId && (
            <input
              type="search"
              className="w-[60%] rounded-md border-2 border-[#bec2cc] bg-[#f3f6ff] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none md:w-[50%]"
              placeholder="Search classworks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {session.user.id === classroom.teacherId && (
            <div className="relative" ref={btnWrapperRef}>
              <Button type="primary" onClick={handleToggleShowCreateClasswork}>
                <svg
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>Create</span>
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
              </div>
            </div>
          )}
          {session.user.id !== classroom.teacherId && (
            <input
              type="search"
              className="w-full rounded-md border-2 border-[#bec2cc] bg-[#f3f6ff] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none md:w-[50%]"
              placeholder="Search classworks"
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
                  {Array(11)
                    .fill(undefined)
                    .map((_, index) => (
                      <li
                        key={index}
                        className="flex flex-col gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
                      >
                        <div className="h-4 w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
                        <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
                      </li>
                    ))}
                </>
              )}
              {optimisticClassworks?.length ? (
                optimisticClassworks
                  ?.filter(
                    (stream) =>
                      (stream.announceTo.includes(session.user.id) &&
                        stream.announceToAll === false) ||
                      stream.announceToAll ||
                      stream.author === session.user.id ||
                      classroom.teacherId === session.user.id,
                  )
                  .map((stream) => (
                    <ClassStreamCard
                      key={stream.id}
                      stream={stream}
                      classroom={classroom}
                      session={session}
                      classId={classId}
                      showComments={false}
                      enrolledClasses={enrolledClasses}
                      deleteStreamPostIsPending={deleteStreamPostIsPending}
                      onDeleteStreamPost={handleDeleteClassworkStream}
                      onGetAllComments={onGetAllComments}
                    />
                  ))
              ) : (
                <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
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
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
      {showStreamForm && (
        <StreamForm
          streamType={classworkType}
          formType="create"
          classroom={classroom}
          session={session}
          enrolledClasses={enrolledClasses}
          onSetShowStreamForm={setShowStreamForm}
          onToggleShowStreamForm={handleToggleShowStreamForm}
        />
      )}
    </section>
  );
}
