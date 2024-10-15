"use client";

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
  if (isLoading) return <AnnouncementLoading />;

  if (!posts || posts.length <= 0) return <NoAnnouncement />;

  return (
    <ul className="flex flex-col items-center justify-center gap-4">
      {posts.map((post) => (
        <PostCard post={post} mutate={mutate} key={post.id} role={role} />
      ))}
    </ul>
  );
}
