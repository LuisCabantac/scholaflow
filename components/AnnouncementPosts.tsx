"use client";

import { useOptimistic } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { IPosts } from "@/components/AnnouncementSection";
import AnnouncementLoading from "@/components/AnnouncementLoading";
import PostCard from "@/components/PostCard";
import NoAnnouncement from "@/components/NoAnnouncement";

export default function AnnouncementPosts({
  role,
  posts,
  isLoading,
  mutate,
}: {
  role: string;
  posts: IPosts[] | null | undefined;
  isLoading: boolean;
  mutate: UseMutateFunction<void, Error, string, unknown>;
}) {
  const [optimisticPosts, optimisticDelete] = useOptimistic(
    posts,
    (curPost, postId) => {
      return curPost?.filter((post) => post.id !== postId);
    },
  );

  function handlePostDelete(id: string) {
    optimisticDelete(id);
    mutate(id);
  }

  if (isLoading) return <AnnouncementLoading />;

  if (!optimisticPosts || optimisticPosts.length <= 0)
    return <NoAnnouncement />;

  return (
    <ul className="flex flex-col items-center justify-center gap-4">
      {optimisticPosts.map((post) => (
        <PostCard
          post={post}
          mutate={handlePostDelete}
          key={post.id}
          role={role}
        />
      ))}
    </ul>
  );
}
