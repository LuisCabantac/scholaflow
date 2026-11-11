import { useTranslation } from "react-i18next";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { authQueries } from "@/queries/auth";
import { classroomQueries } from "@/queries/classroom";

import AuthCard from "@/components/auth/AuthCard";
import InviteSection from "@/components/classroom/InviteSection";

export const Route = createFileRoute("/join-class/$classCode")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData({
      ...authQueries.session(),
      revalidateIfStale: true,
    });

    if (!session) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }

    return { user: session.user };
  },
  loader: async ({ context: { queryClient, user }, params: { classCode } }) => {
    const classroom = await queryClient.fetchQuery({
      ...classroomQueries.byCode(classCode),
      staleTime: 0,
    });

    if (!classroom) throw redirect({ to: "/classroom" });

    const enrolled = await queryClient.fetchQuery({
      ...classroomQueries.enrolledByClassAndSession(user.id, classroom.id),
      staleTime: 0,
    });

    if (enrolled || classroom.teacherId === user.id) {
      throw redirect({ to: "/classroom" });
    }

    return { classroom };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Join - ${loaderData?.classroom.name ?? ""} | ScholaFlow` },
      {
        name: "description",
        content:
          loaderData?.classroom.description ||
          `${loaderData?.classroom.name ?? ""} class.`,
      },
    ],
  }),
  component: JoinClassPage,
});

function JoinClassPage() {
  const { t } = useTranslation("classroom", { keyPrefix: "invite" });
  const { user } = Route.useRouteContext();
  const { classroom } = Route.useLoaderData();

  return (
    <AuthCard title={t("title")}>
      <InviteSection classroom={classroom} user={user} />
    </AuthCard>
  );
}
