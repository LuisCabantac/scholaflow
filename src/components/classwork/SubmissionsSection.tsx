import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useSuspenseQuery } from "@tanstack/react-query";

import type { SessionUser } from "@/types/auth";
import type { Classroom, Stream } from "@/lib/schema";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";
import { assignedUsers, submissionCounts } from "@/lib/classwork-rules";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmissionStats from "@/components/classwork/SubmissionStats";
import SubmissionDetail from "@/components/classwork/SubmissionDetail";
import SubmissionUserList from "@/components/classwork/SubmissionUserList";

export default function SubmissionsSection({
  stream,
  classroom,
  user,
  selectedUserId,
  selectedName,
}: {
  stream: Stream;
  classroom: Classroom;
  user: SessionUser;
  selectedUserId: string | undefined;
  selectedName: string | undefined;
}) {
  const { t } = useTranslation("classwork", { keyPrefix: "submissions" });
  const [expanded, setExpanded] = useState(false);

  const { data: enrolled } = useSuspenseQuery(
    classroomQueries.enrolledByClass(classroom.id),
  );
  const { data: classworks } = useSuspenseQuery(
    classworkQueries.assignedByStream(classroom.id, stream.id),
  );

  const works = classworks ?? [];
  const counts = submissionCounts(works, enrolled, stream);
  const assigned = assignedUsers(enrolled, stream);

  return (
    <section className="grid items-start">
      <div className="flex flex-col items-start gap-2">
        <Tabs defaultValue="submissions">
          <TabsList>
            <TabsTrigger value="instructions" asChild>
              <Link
                to="/classroom/class/$classId/stream/$streamId"
                params={{ classId: stream.classId, streamId: stream.id }}
              >
                {t("instructions")}
              </Link>
            </TabsTrigger>
            <TabsTrigger value="submissions" asChild>
              <Link
                to="/classroom/class/$classId/stream/$streamId/submissions"
                params={{ classId: stream.classId, streamId: stream.id }}
              >
                {t("title")}
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid w-full items-start gap-8 md:grid-cols-[1fr_2fr]">
          <div className="grid w-full gap-2">
            <h2 className="text-foreground overflow-hidden text-lg font-medium text-ellipsis whitespace-nowrap md:text-xl">
              {stream.title}
            </h2>
            <SubmissionStats counts={counts} />
            <SubmissionUserList
              stream={stream}
              classworks={works}
              assigned={assigned}
              onSelect={() => setExpanded(true)}
            />
          </div>
          <SubmissionDetail
            stream={stream}
            classroom={classroom}
            user={user}
            selectedUserId={selectedUserId}
            selectedName={selectedName}
            expanded={expanded}
            onClose={() => setExpanded(false)}
          />
        </div>
      </div>
    </section>
  );
}
