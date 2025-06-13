"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useOptimistic, useState } from "react";
import { Search, SquarePen } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import noClasworks from "@/public/app/no_classworks.svg";
import { deleteClassStreamPost, deleteTopic } from "@/lib/classroom-actions";
import {
  Classroom,
  ClassTopic,
  Session,
  StreamComment,
  Stream,
  EnrolledClass,
} from "@/lib/schema";

import { Input } from "@/components/ui/input";
import TopicCard from "@/components/TopicCard";
import { Button } from "@/components/ui/button";
import StreamCard from "@/components/StreamCard";
import StreamForm from "@/components/StreamForm";
import TopicDialog from "@/components/TopicDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StreamType = "stream" | "assignment" | "quiz" | "question" | "material";

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
  const [classworkType, setClassworkType] = useState<StreamType>("stream");
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

  function handleSetClassworkType(type: StreamType) {
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

  return (
    <section>
      <div className="flex items-center justify-between pb-2">
        <Tabs defaultValue="classwork">
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
      <div>
        <div className="flex items-center justify-between">
          {session.id === classroom.teacherId && (
            <label className="group flex w-[60%] items-center gap-2 rounded-full border bg-foreground/10 text-sm focus-within:border-ring md:w-[50%]">
              <Search className="mb-0.5 ml-3 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
              <Input
                type="search"
                placeholder="Search..."
                className="mb-0.5 border-0 bg-transparent pl-0 shadow-none drop-shadow-none focus-visible:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
          {session.id === classroom.teacherId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <SquarePen className="h-12 w-12" />
                  Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => {
                      handleSetClassworkType("assignment");
                      handleToggleShowCreateClasswork();
                    }}
                    className="w-full text-start"
                  >
                    Assignment
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={() => {
                      handleSetClassworkType("quiz");
                      handleToggleShowCreateClasswork();
                    }}
                    className="w-full text-start"
                  >
                    Quiz
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={() => {
                      handleSetClassworkType("material");
                      handleToggleShowCreateClasswork();
                    }}
                    className="w-full text-start"
                  >
                    Material
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={() => {
                      handleToggleShowTopicForm();
                      handleToggleShowCreateClasswork();
                    }}
                    className="w-full text-start"
                  >
                    Topic
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {session.id !== classroom.teacherId && (
            <label className="group flex w-full items-center gap-2 rounded-full border bg-foreground/10 text-sm focus-within:border-ring md:w-[50%]">
              <Search className="mb-0.5 ml-3 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
              <Input
                type="search"
                placeholder="Search..."
                className="mb-0.5 border-0 bg-transparent pl-0 shadow-none drop-shadow-none focus-visible:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
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
                        className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4"
                        role="status"
                      >
                        <span className="sr-only">Loading…</span>
                        <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                        <div className="grid gap-2">
                          <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                          <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
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
                  className={`mt-1 ${optimisticClassworks?.length ? "border-t border-border pt-2" : ""}`}
                >
                  <ul className="grid gap-4">
                    {optimisticTopics.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        topics={topics as ClassTopic[] | null}
                        session={session}
                        classroom={classroom}
                        classworks={classworks as Stream[] | null}
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
          topics={topics as ClassTopic[] | null}
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
