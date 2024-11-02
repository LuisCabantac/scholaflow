"use client";

import { useOptimistic } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { IPost } from "@/components/AnnouncementSection";
import AnnouncementLoading from "@/components/AnnouncementLoading";
import PostCard from "@/components/PostCard";
import NoAnnouncement from "@/components/NoAnnouncement";

export default function AnnouncementPostLists({
  role,
  posts,
  postsIsPending,
  deletePostIsPending,
  handleDeletePost,
}: {
  role: string;
  posts: IPost[] | null | undefined;
  postsIsPending: boolean;
  deletePostIsPending: boolean;
  handleDeletePost: UseMutateFunction<void, Error, string, unknown>;
}) {
  const [optimisticPosts, optimisticDelete] = useOptimistic(
    posts,
    (curPost, postId) => {
      return curPost?.filter((post) => post.id !== postId);
    },
  );

  function handlePostDelete(id: string) {
    optimisticDelete(id);
    handleDeletePost(id);
  }

  if (postsIsPending) return <AnnouncementLoading />;

  if (!optimisticPosts || !optimisticPosts.length) return <NoAnnouncement />;

  return (
    <ul className="flex flex-col items-center justify-center gap-4">
      {optimisticPosts.map((post) => (
        <PostCard
          role={role}
          post={post}
          onPostDelete={handlePostDelete}
          deletePostIsPending={deletePostIsPending}
          key={post.id}
        />
      ))}
    </ul>
  );
}
