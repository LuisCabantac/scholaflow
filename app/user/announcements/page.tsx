import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getAllLevels, getPosts, getUser } from "@/lib/data-service";
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
    return (
      <div className="flex h-[20rem] items-center justify-center text-xl font-bold">
        You must be logged in.
      </div>
    );
  }

  const { school: hasSchool } = await getUser(session.user.email);

  const allLevels = await getAllLevels(hasSchool);

  async function handleGetPosts(school: string, levels: string) {
    "use server";
    const data = await getPosts(school, levels);
    return data;
  }

  async function handleDeletePosts(postId: string) {
    "use server";
    await deletePost(postId);
  }

  if (
    session.user.verified &&
    (session.user.role === "student" ||
      session.user.role === "teacher" ||
      session.user.role === "admin")
  )
    return (
      <section>
        <AnnouncementSection
          role={session.user.role}
          hasSchool={hasSchool}
          allLevels={allLevels as ILevels[]}
          handleGetPosts={handleGetPosts}
          handleDeletePosts={handleDeletePosts}
        />
      </section>
    );

  return (
    <div className="flex h-[20rem] items-center justify-center text-xl font-bold">
      Please contact your school to be able to access this page.
    </div>
  );
}
