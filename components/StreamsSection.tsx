"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useOptimistic, useRef, useState } from "react";
import { Check, ChevronDown, Clipboard } from "lucide-react";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { deleteClassStreamPost } from "@/lib/classroom-actions";
import {
  Classroom,
  ClassTopic,
  EnrolledClass,
  Session,
  Stream,
  StreamComment,
} from "@/lib/schema";

import ClassForm from "@/components/ClassForm";
import { Button } from "@/components/ui/button";
import StreamForm from "@/components/StreamForm";
import StreamCard from "@/components/StreamCard";
import NoClassStreams from "@/components/NoClassStreams";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const illustrationArr = [
  "M1 1h46v62H1zM9 63V2M14 15h28M14 21h28M63 3v50l-4 8-4-8V3zM55 7h-4v10",
  "M4 3h40v58H4zM34 3v57M8 16H0M8 8H0M8 24H0M8 32H0M8 40H0M8 48H0M8 56H0M55 1v53l4 8 4-8V1zM55 11h8",
  "M63 3v50l-4 8-4-8V3zM55 7h-4v10M42 15v46H1V3h29zM8 13h12M8 23h27M8 31h27M8 39h27M8 47h27",
  "M22 1h16v62H22zM31 12h7M38 22h-3M38 42h-3M31 32h7M31 52h7M16 63V10l-4-8-4 8v53zM16 53H8M56 3v50l-4 8-4-8V3zM48 7h-4v10",
  "M36 5V1h-8v4h-4l-2 8h20l-2-8zM14 13h36v46H14z",
];

export default function StreamsSection({
  topics,
  session,
  classroom,
  onDeleteClass,
  enrolledClasses,
  onGetAllComments,
  onGetAllClassStreams,
}: {
  topics: ClassTopic[] | null;
  session: Session;
  classroom: Classroom;
  onDeleteClass: (classId: string) => Promise<void>;
  enrolledClasses: EnrolledClass[] | null;
  onGetAllComments: (streamId: string) => Promise<StreamComment[] | null>;
  onGetAllClassStreams: (classId: string) => Promise<Stream[] | null>;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const filterWrapperRef = useRef<HTMLDivElement>(null);
  const { useClickOutsideHandler } = useClickOutside();
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const { data: streams, isPending: streamsIsPending } = useQuery({
    queryKey: [`streams--${classroom.id}`],
    queryFn: () => onGetAllClassStreams(classroom.id),
  });

  const { mutate: deleteStreamPost, isPending: deleteStreamPostIsPending } =
    useMutation({
      mutationFn: deleteClassStreamPost,
      onSuccess: () => {
        toast.success("Post has been successfully deleted!");

        queryClient.invalidateQueries({
          queryKey: [`streams--${classroom.id}`],
        });
        queryClient.invalidateQueries({
          queryKey: [`classworks--${classroom.id}`],
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const [optimisticStreams, optimisticDelete] = useOptimistic(
    streams,
    (curStream, streamId) => {
      return curStream?.filter((stream) => stream.id !== streamId);
    },
  );

  const assignedClasswork = optimisticStreams?.filter(
    (stream) =>
      ((stream.announceTo.includes(session.id) &&
        stream.announceToAll === false) ||
        stream.announceToAll ||
        stream.userId === session.id ||
        classroom.teacherId === session.id) &&
      ((stream.scheduledAt
        ? new Date(stream.scheduledAt) < new Date()
        : true) ||
        classroom.teacherId === session.id) &&
      !(stream.type === "stream" || stream.type === "material"),
  )[0];

  function handleToggleShowClassForm() {
    setShowClassForm(!showClassForm);
  }

  function handleToggleShowStreamForm() {
    setShowStreamForm(!showStreamForm);
  }

  function handleDeleteStreamPost(streamId: string) {
    optimisticDelete(streamId);
    deleteStreamPost(streamId);
  }

  function handleToggleShowFilterDropdown() {
    setShowFilterDropdown(!showFilterDropdown);
  }

  useClickOutsideHandler(
    filterWrapperRef,
    () => {
      setShowFilterDropdown(false);
    },
    false,
  );

  return (
    <section className="relative">
      <div className="flex items-center justify-between pb-2">
        <Tabs defaultValue="stream">
          <TabsList>
            <TabsTrigger value="stream" asChild>
              <Link href={`/classroom/class/${classroom.id}`}>Stream</Link>
            </TabsTrigger>
            <TabsTrigger value="classwork" asChild>
              <Link href={`/classroom/class/${classroom.id}/classwork`}>
                Classwork
              </Link>
            </TabsTrigger>
            <TabsTrigger value="people" asChild>
              <Link href={`/classroom/class/${classroom.id}/people`}>
                People
              </Link>
            </TabsTrigger>
            <TabsTrigger value="chat" asChild>
              <Link href={`/classroom/class/${classroom.id}/chat`}>Chat</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-2">
        <div
          className="relative h-[9rem] rounded-xl shadow-sm md:h-[10rem]"
          style={{ backgroundColor: classroom.cardBackground }}
        >
          <div className="absolute left-3 top-3 w-[80%] text-balance drop-shadow-sm md:left-4 md:top-4">
            <h5 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold text-[#eeeeee] md:text-2xl">
              {classroom.name}
            </h5>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium text-[#eeeeee]">
              {classroom.subject && `${classroom.subject} · `}
              {classroom.section}
            </p>
          </div>
          <div className="absolute bottom-3 left-3 flex w-[88%] items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 stroke-[#F5F5F5] md:size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[#F5F5F5]">
                {classroom.teacherName}
              </p>
            </div>
            {enrolledClasses?.length ? (
              <>
                <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[#F5F5F5]">
                  ·
                </p>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-4 stroke-[#F5F5F5] md:size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[#F5F5F5]">
                    {enrolledClasses?.length}{" "}
                    {enrolledClasses && enrolledClasses?.length > 1
                      ? "students"
                      : "student"}
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <div className="absolute bottom-5 right-4">
            <svg
              viewBox="0 0 64 64"
              className="w-24 -rotate-45 mix-blend-overlay md:w-28"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeMiterlimit={10}
                strokeWidth={2}
                d={illustrationArr[classroom.illustrationIndex ?? 0]}
              />
            </svg>
          </div>
          {classroom.teacherId === session.id && (
            <button
              className="absolute right-3 top-3"
              type="button"
              onClick={handleToggleShowClassForm}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5 stroke-[#F5F5F5] md:size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="grid items-start gap-2 md:grid-cols-[1fr_15rem]">
          <div>
            {session.id === classroom.teacherId ||
            classroom.allowUsersToPost ? (
              <div
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4"
                onClick={handleToggleShowStreamForm}
              >
                <Image
                  src={session.image ?? ""}
                  alt="user's avatar"
                  width={40}
                  height={40}
                  className="h-8 w-8 flex-shrink-0 rounded-full md:h-10 md:w-10"
                />
                <p className="text-foreground">Share with your class...</p>
              </div>
            ) : null}
            {(!optimisticStreams && !streamsIsPending) ||
              (!optimisticStreams?.filter(
                (stream) =>
                  ((stream.announceTo.includes(session.id) &&
                    stream.announceToAll === false) ||
                    stream.announceToAll ||
                    stream.userId === session.id ||
                    classroom.teacherId === session.id) &&
                  ((stream.scheduledAt
                    ? new Date(stream.scheduledAt) < new Date()
                    : true) ||
                    classroom.teacherId === session.id),
              ) ? (
                <div className="mt-2"></div>
              ) : (
                <div className="flex items-start justify-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-auto p-0 hover:bg-transparent"
                        onClick={handleToggleShowFilterDropdown}
                      >
                        <span>
                          {searchParams.get("sort") === null
                            ? "All"
                            : searchParams.get("sort") === "stream"
                              ? "Post"
                              : `${searchParams.get("sort")?.charAt(0).toUpperCase()}${searchParams.get("sort")?.slice(1).split("-").join(" ")}`}
                        </span>
                        <ChevronDown
                          strokeWidth={3}
                          className={`${showFilterDropdown ? "rotate-180" : "rotate-0"} w-4 transition-transform`}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/classroom/class/${classroom.id}?sort=all`}
                          scroll={false}
                          className={`${(searchParams.get("sort") === "all" || searchParams.get("sort") === null) && "font-medium"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left hover:bg-foreground/20`}
                        >
                          <span>All</span>
                          {(searchParams.get("sort") === "all" ||
                            searchParams.get("sort") === null) && (
                            <Check strokeWidth={3} className="h-4 w-4" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/classroom/class/${classroom.id}?sort=stream`}
                          scroll={false}
                          className={`${searchParams.get("sort") === "stream" && "font-medium"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left hover:bg-foreground/20`}
                        >
                          <span>Post</span>
                          {searchParams.get("sort") === "stream" && (
                            <Check strokeWidth={3} className="h-4 w-4" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/classroom/class/${classroom.id}?sort=assignment`}
                          scroll={false}
                          className={`${searchParams.get("sort") === "assignment" && "font-medium"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left hover:bg-foreground/20`}
                        >
                          <span>Assignment</span>
                          {searchParams.get("sort") === "assignment" && (
                            <Check strokeWidth={3} className="h-4 w-4" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/classroom/class/${classroom.id}?sort=quiz`}
                          scroll={false}
                          className={`${searchParams.get("sort") === "quiz" && "font-medium"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left hover:bg-foreground/20`}
                        >
                          <span>Quiz</span>
                          {searchParams.get("sort") === "quiz" && (
                            <Check strokeWidth={3} className="h-4 w-4" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/classroom/class/${classroom.id}?sort=material`}
                          scroll={false}
                          className={`${searchParams.get("sort") === "material" && "font-medium"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left hover:bg-foreground/20`}
                        >
                          <span>Material</span>
                          {searchParams.get("sort") === "material" && (
                            <Check strokeWidth={3} className="h-4 w-4" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            <ul className="flex flex-col gap-2">
              {streamsIsPending && (
                <>
                  <li
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                      <div className="grid gap-2">
                        <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="flex gap-2 rounded-md border border-border bg-card p-3 shadow-sm md:p-4"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </li>
                  <li
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                      <div className="grid gap-2">
                        <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="flex gap-2 rounded-md border border-border bg-card p-3 shadow-sm md:p-4"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </li>
                  <li
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                      <div className="grid gap-2">
                        <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="flex gap-2 rounded-md border border-border bg-card p-3 shadow-sm md:p-4"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </li>
                </>
              )}
              {(!optimisticStreams && !streamsIsPending) ||
              (!optimisticStreams
                ?.filter(
                  (stream) =>
                    ((stream.announceTo.includes(session.id) &&
                      stream.announceToAll === false) ||
                      stream.announceToAll ||
                      stream.userId === session.id ||
                      classroom.teacherId === session.id) &&
                    ((stream.scheduledAt
                      ? new Date(stream.scheduledAt) < new Date()
                      : true) ||
                      classroom.teacherId === session.id),
                )
                .filter((stream) =>
                  !(
                    searchParams.get("sort") === null ||
                    searchParams.get("sort") === "all"
                  )
                    ? stream.type === searchParams.get("sort")
                    : true,
                ).length &&
                !streamsIsPending) ? (
                <NoClassStreams />
              ) : null}
              {optimisticStreams
                ?.filter(
                  (stream) =>
                    ((stream.announceTo.includes(session.id) &&
                      stream.announceToAll === false) ||
                      stream.announceToAll ||
                      stream.userId === session.id ||
                      classroom.teacherId === session.id) &&
                    ((stream.scheduledAt
                      ? new Date(stream.scheduledAt) < new Date()
                      : true) ||
                      classroom.teacherId === session.id),
                )
                .filter((stream) =>
                  !(
                    searchParams.get("sort") === null ||
                    searchParams.get("sort") === "all"
                  )
                    ? stream.type === searchParams.get("sort")
                    : true,
                )
                .map((stream) => (
                  <StreamCard
                    key={stream.id}
                    topics={topics}
                    stream={stream}
                    classroom={classroom}
                    session={session}
                    showComments={true}
                    enrolledClasses={enrolledClasses}
                    onDeleteStreamPost={handleDeleteStreamPost}
                    onGetAllComments={onGetAllComments}
                    deleteStreamPostIsPending={deleteStreamPostIsPending}
                  />
                ))}
            </ul>
          </div>
          <aside className="hidden gap-2 md:grid">
            {session.id === classroom.teacherId && (
              <Card>
                <CardHeader className="px-4 pb-0 pt-4 text-lg font-medium tracking-tight">
                  Class code
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-lg text-sidebar-accent-foreground">
                    {classroom.code}
                  </p>
                  <Button
                    variant="ghost"
                    className="h-10 w-10"
                    onClick={async () => {
                      await navigator.clipboard
                        .writeText(classroom.code)
                        .then(() => toast.success("Copied to clipboard!"));
                    }}
                  >
                    <Clipboard className="h-5 w-5 stroke-primary" />
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="px-4 pb-0 pt-4 text-lg font-medium tracking-tight">
                Recent work
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {assignedClasswork ? (
                  <div className="mt-2">
                    <Link
                      href={`/classroom/class/${assignedClasswork.classId}/stream/${assignedClasswork.id}`}
                      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="mt-1 size-6 flex-shrink-0 stroke-sidebar-ring"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium group-hover:underline">
                            {assignedClasswork.title}
                          </p>
                          <div className="mt-1 grid gap-1 text-xs">
                            <p>
                              Posted{" "}
                              {isToday(assignedClasswork.createdAt)
                                ? "today"
                                : isYesterday(assignedClasswork.createdAt)
                                  ? "yesterday"
                                  : format(
                                      assignedClasswork.createdAt,
                                      "MMM d",
                                    )}
                            </p>
                            {assignedClasswork.dueDate ? (
                              <p className="text-foreground/70">
                                {isToday(assignedClasswork.dueDate)
                                  ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                  : isYesterday(assignedClasswork.dueDate)
                                    ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                    : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                              </p>
                            ) : (
                              <p className="text-foreground/70">No due date</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <p className="flex h-[8rem] items-center justify-center text-center font-medium text-foreground/70">
                    No classworks have been given yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
      {showClassForm && (
        <ClassForm
          type="edit"
          session={session}
          classroom={classroom}
          onDeleteClass={onDeleteClass}
          onSetShowClassForm={setShowClassForm}
          onToggleShowClassForm={handleToggleShowClassForm}
        />
      )}
      {showStreamForm && (
        <StreamForm
          formType="create"
          topics={topics}
          session={session}
          classroom={classroom}
          streamType="stream"
          enrolledClasses={enrolledClasses}
          onSetShowStreamForm={setShowStreamForm}
          onToggleShowStreamForm={handleToggleShowStreamForm}
        />
      )}
    </section>
  );
}
