import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SquarePen } from "lucide-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useNow } from "@/hooks/use-now";
import type { StreamType } from "@/lib/schema";
import type { SessionUser } from "@/types/auth";
import { classworkKeys } from "@/queries/classwork";
import type { Classroom, Stream } from "@/lib/schema";
import { classroomQueries } from "@/queries/classroom";
import { visibleStreams } from "@/lib/stream-visibility";
import { streamKeys, streamQueries } from "@/queries/stream";
import { deleteTopicFn } from "@/server/functions/class-topic";
import { deleteClassStreamFn } from "@/server/functions/stream";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { classTopicKeys, classTopicQueries } from "@/queries/class-topic";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StreamCard from "@/components/stream/StreamCard";
import StreamForm from "@/components/stream/StreamForm";
import TopicCard from "@/components/classwork/TopicCard";
import TopicDialog from "@/components/stream/TopicDialog";
import NoClassworks from "@/components/classwork/NoClassworks";
import ClassworksLoading from "@/components/classwork/ClassworksLoading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ClassworksSection({
  classroom,
  user,
}: {
  classroom: Classroom;
  user: SessionUser;
}) {
  const { t } = useTranslation("classwork");
  const now = useNow();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [classworkType, setClassworkType] = useState<StreamType>("assignment");

  const query = useDebouncedValue(search.trim());
  const isTeacher = user.id === classroom.teacherId;

  const { data: topics } = useSuspenseQuery(
    classTopicQueries.byClass(classroom.id),
  );
  const { data: enrolledClasses } = useSuspenseQuery(
    classroomQueries.enrolledByClass(classroom.id),
  );
  const classworks = useQuery({
    ...streamQueries.classworksByClass(classroom.id, query),
    placeholderData: keepPreviousData,
  });

  const deleteStream = useMutation({
    mutationFn: async (streamId: string) => {
      const result = await deleteClassStreamFn({
        data: { classroomId: classroom.id, streamId },
      });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (streamId) => {
      const key = streamKeys.classworksByClass(classroom.id, query);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current: Stream[] | null | undefined) =>
        current?.filter((stream) => stream.id !== streamId),
      );
      return { key, previous };
    },
    onError: (error, _streamId, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("deleted")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: streamKeys.all });
      queryClient.invalidateQueries({ queryKey: classworkKeys.all });
      queryClient.invalidateQueries({
        queryKey: classTopicKeys.byClass(classroom.id),
      });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const result = await deleteTopicFn({ data: topicId });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (topicId) => {
      const key = classTopicKeys.byClass(classroom.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current: typeof topics) =>
        current?.filter((topic) => topic.id !== topicId),
      );
      return { key, previous };
    },
    onError: (error, _topicId, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("topic.deleted")),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: classTopicKeys.byClass(classroom.id),
      });
      queryClient.invalidateQueries({ queryKey: streamKeys.all });
    },
  });

  const untopiced = visibleStreams(
    classworks.data,
    user.id,
    classroom.teacherId,
    now,
  ).filter((stream) => !stream.topicId);
  const isEmpty = !untopiced.length && !topics?.length && !classworks.isPending;

  function openForm(type: StreamType) {
    setClassworkType(type);
    setShowStreamForm(true);
  }

  const searchField = (className: string) => (
    <label
      htmlFor="classwork-search"
      className={`group bg-foreground/10 focus-within:border-ring flex items-center gap-2 rounded-full border text-sm ${className}`}
    >
      <Search className="stroke-muted-foreground mb-0.5 ml-3 h-5 w-5 md:h-4 md:w-4" />
      <Input
        id="classwork-search"
        type="search"
        placeholder={t("search")}
        className="mb-0.5 border-0 bg-transparent pl-0 shadow-none drop-shadow-none focus-visible:ring-0"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </label>
  );

  return (
    <section>
      <div>
        <div className="flex items-center justify-between">
          {isTeacher ? (
            <>
              {searchField("w-[60%] md:w-[50%]")}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <SquarePen className="h-12 w-12" />
                    {t("create")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openForm("assignment")}>
                    {t("menu.assignment")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openForm("quiz")}>
                    {t("menu.quiz")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openForm("material")}>
                    {t("menu.material")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowTopicForm(true)}>
                    {t("menu.topic")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            searchField("w-full md:w-[50%]")
          )}
        </div>
        <div className="grid items-start gap-2">
          <div className="mt-2">
            <ul className="flex flex-col gap-2">
              {classworks.isPending && <ClassworksLoading />}
              {isEmpty ? (
                <NoClassworks />
              ) : (
                untopiced.map((stream) => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    classroom={classroom}
                    topics={topics}
                    enrolledClasses={enrolledClasses}
                    user={user}
                    showComments={false}
                    onDeleteStream={(streamId) => deleteStream.mutate(streamId)}
                    deleteIsPending={deleteStream.isPending}
                  />
                ))
              )}
              {topics?.length ? (
                <li
                  className={`mt-1 ${classworks.data?.length ? "border-border border-t pt-2" : ""}`}
                >
                  <ul className="grid gap-4">
                    {topics.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        topics={topics}
                        classroom={classroom}
                        user={user}
                        classworks={classworks.data ?? null}
                        enrolledClasses={enrolledClasses}
                        onDeleteTopic={(topicId) => deleteTopic.mutate(topicId)}
                        onDeleteStream={(streamId) =>
                          deleteStream.mutate(streamId)
                        }
                        deleteTopicIsPending={deleteTopic.isPending}
                        deleteStreamIsPending={deleteStream.isPending}
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
          formType="create"
          streamType={classworkType}
          topics={topics}
          classroom={classroom}
          enrolledClasses={enrolledClasses}
          user={user}
          onClose={() => setShowStreamForm(false)}
        />
      )}
      {showTopicForm && (
        <TopicDialog
          type="create"
          classroom={classroom}
          onClose={() => setShowTopicForm(false)}
        />
      )}
    </section>
  );
}
