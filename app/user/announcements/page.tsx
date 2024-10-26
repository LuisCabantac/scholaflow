import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getAllLevels, getAllPosts, getPosts } from "@/lib/data-service";
import { deletePost } from "@/lib/announcements-actions";

import AnnouncementSection from "@/components/AnnouncementSection";

export interface ILevels {
  id: string;
  level: string;
  created_at: string;
  school: string;
}

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) {
    return redirect("/signin");
  }

  const allLevels = await getAllLevels();

  async function handleGetPosts(levels: string) {
    "use server";
    if (levels === "all-levels") {
      const data = await getAllPosts();
      return data;
    }

    const data = await getPosts(levels);
    return data;
  }

  async function handleDeletePosts(postId: string) {
    "use server";
    await deletePost(postId);
  }

  if (!session.user.verified && session.user.role === "guest")
    return redirect("/");

  return (
    <AnnouncementSection
      role={session.user.role}
      allLevels={allLevels as ILevels[]}
      onGetPosts={handleGetPosts}
      onDeletePosts={handleDeletePosts}
    />
  );
}
