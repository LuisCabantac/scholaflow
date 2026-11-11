import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { SessionUser } from "@/types/auth";
import type { StreamSort } from "@/types/stream";
import { classworkKeys } from "@/queries/classwork";
import type { Classroom, Stream } from "@/lib/schema";
import { classroomQueries } from "@/queries/classroom";
import { classTopicQueries } from "@/queries/class-topic";
import { streamKeys, streamQueries } from "@/queries/stream";
import { deleteClassStreamFn } from "@/server/functions/stream";
import {
  filterStreamsByType,
  latestAssignedClasswork,
  visibleStreams,
} from "@/lib/stream-visibility";

import StreamCard from "@/components/stream/StreamCard";
import StreamForm from "@/components/stream/StreamForm";
import ClassForm from "@/components/classroom/ClassForm";
import StreamFilter from "@/components/stream/StreamFilter";
import ClassCodeCard from "@/components/stream/ClassCodeCard";
import NoClassStreams from "@/components/stream/NoClassStreams";
import RecentWorkCard from "@/components/stream/RecentWorkCard";
import StreamComposer from "@/components/stream/StreamComposer";
import ClassHeaderCard from "@/components/stream/ClassHeaderCard";

export default function StreamsSection({
  classroom,
  user,
  sort,
}: {
  classroom: Classroom;
  user: SessionUser;
  sort: StreamSort;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("stream");

  const [showClassForm, setShowClassForm] = useState(false);
  const [showStreamForm, setShowStreamForm] = useState(false);

  const { data: streams } = useSuspenseQuery(
    streamQueries.byClass(classroom.id),
  );
  const { data: topics } = useSuspenseQuery(
    classTopicQueries.byClass(classroom.id),
  );
  const { data: enrolledClasses } = useSuspenseQuery(
    classroomQueries.enrolledByClass(classroom.id),
  );

  const isTeacher = classroom.teacherId === user.id;
  const visible = visibleStreams(streams, user.id, classroom.teacherId);
  const listed = filterStreamsByType(visible, sort);
  const recentWork = latestAssignedClasswork(
    streams,
    user.id,
    classroom.teacherId,
  );

  const deleteStream = useMutation({
    mutationFn: async (streamId: string) => {
      const result = await deleteClassStreamFn({
        data: { classroomId: classroom.id, streamId },
      });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (streamId) => {
      const key = streamKeys.byClass(classroom.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Stream[] | null>(key);
      queryClient.setQueryData<Stream[] | null>(key, (old) =>
        old ? old.filter((s) => s.id !== streamId) : old,
      );
      return { previous, key };
    },
    onError: (error, _id, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("card.messages.postDeleted")),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: streamKeys.all }),
        queryClient.invalidateQueries({ queryKey: classworkKeys.all }),
      ]),
  });

  return (
    <section className="relative">
      <div className="grid gap-2">
        <ClassHeaderCard
          classroom={classroom}
          isTeacher={isTeacher}
          studentCount={enrolledClasses?.length ?? 0}
          onOpenSettings={() => setShowClassForm(true)}
        />
        <div className="grid items-start gap-2 md:grid-cols-[1fr_15rem]">
          <div>
            {(isTeacher || classroom.allowUsersToPost) && (
              <StreamComposer
                user={user}
                onOpen={() => setShowStreamForm(true)}
              />
            )}
            {visible.length ? (
              <StreamFilter classId={classroom.id} sort={sort} />
            ) : (
              <div className="mt-2" />
            )}
            <ul className="flex flex-col gap-2">
              {listed.length === 0 && <NoClassStreams />}
              {listed.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  classroom={classroom}
                  topics={topics}
                  enrolledClasses={enrolledClasses}
                  user={user}
                  showComments={true}
                  onDeleteStream={deleteStream.mutate}
                  deleteIsPending={deleteStream.isPending}
                />
              ))}
            </ul>
          </div>
          <aside className="hidden gap-2 md:grid">
            {isTeacher && <ClassCodeCard code={classroom.code} />}
            <RecentWorkCard stream={recentWork} />
          </aside>
        </div>
      </div>
      {showClassForm && (
        <ClassForm
          type="edit"
          user={user}
          classroom={classroom}
          onClose={() => setShowClassForm(false)}
        />
      )}
      {showStreamForm && (
        <StreamForm
          formType="create"
          streamType="stream"
          topics={topics}
          classroom={classroom}
          enrolledClasses={enrolledClasses}
          user={user}
          onClose={() => setShowStreamForm(false)}
        />
      )}
    </section>
  );
}
