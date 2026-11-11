import { createFileRoute } from "@tanstack/react-router";

import { userQueries } from "@/queries/user";
import { userManagementQueries } from "@/queries/user-management";

import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileSection from "@/components/profile/ProfileSection";

export const Route = createFileRoute("/_main/profile")({
  loader: async ({ context: { queryClient, user } }) => {
    const [profile] = await Promise.all([
      queryClient.ensureQueryData(userQueries.byId(user.id)),
      queryClient.ensureQueryData(
        userManagementQueries.roleRequestByUser(user.id),
      ),
    ]);

    return { name: profile?.name ?? user.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Profile"} | ScholaFlow` },
      {
        name: "description",
        content:
          "View and manage your profile information, settings, and connected accounts.",
      },
    ],
  }),
  pendingComponent: ProfileLoading,
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();

  return <ProfileSection user={user} />;
}
