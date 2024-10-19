import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getAllLevels, getPostById } from "@/lib/data-service";

import AnnouncementUpdateForm from "@/components/AnnouncementUpdateForm";

export default async function Page({ params }: { params: Params }) {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "admin") return redirect("/user/announcements");

  const { id } = params;

  const { title, description, levels } = await getPostById(id);

  const allLevels = await getAllLevels();

  return (
    <AnnouncementUpdateForm
      id={id}
      title={title}
      description={description}
      levels={levels}
      options={allLevels}
    />
  );
}
