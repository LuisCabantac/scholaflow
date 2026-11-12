import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { messageQueries } from "@/queries/message";
import { classroomQueries } from "@/queries/classroom";

import ChatLoading from "@/components/chat/ChatLoading";
import ClassChatSection from "@/components/chat/ClassChatSection";

export const Route = createFileRoute("/_main/classroom/class/$classId/chat")({
  loader: async ({ context: { queryClient }, params: { classId } }) => {
    await queryClient.ensureQueryData(messageQueries.byClass(classId));
  },
  head: ({ match }) => ({
    meta: [
      { title: `Chat - ${match.context.classroom.name} | ScholaFlow` },
      {
        name: "description",
        content: `Connect with your classmates! Discuss course material, ask questions, and collaborate in ${match.context.classroom.name} class chat.`,
      },
    ],
  }),
  pendingComponent: ChatLoading,
  component: ChatPage,
});

function ChatPage() {
  const { classId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: classroom } = useSuspenseQuery(classroomQueries.byId(classId));

  if (!classroom) return null;

  return <ClassChatSection classroom={classroom} user={user} />;
}
