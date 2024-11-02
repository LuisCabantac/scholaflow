"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ILevels } from "@/app/user/announcements/page";

import FilterLevelPosts from "@/components/FilterLevelPosts";
import AnnouncementCreateForm from "@/components/AnnouncementCreateForm";
import AnnouncementPostLists from "@/components/AnnouncementPostLists";

export interface IPost {
  id: string;
  author: string;
  created_at: string;
  caption: string;
  image: string[];
  links: string[];
  school: string;
  schoolAvatar: string;
  schoolName: string;
  authorName: string;
  levels: string;
  updatedPost: boolean;
}

export default function AnnouncementSection({
  role,
  allLevels,
  onGetPosts,
  onDeletePosts,
}: {
  role: string;
  allLevels: ILevels[] | null;
  onGetPosts: (levels: string) => Promise<IPost[] | null>;
  onDeletePosts: (postId: string) => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  const { data: posts, isPending: postsIsPending } = useQuery({
    queryKey: [searchParams.get("filter") ?? "all-levels"],
    queryFn: () => onGetPosts(searchParams.get("filter") ?? "all-levels"),
  });

  const { mutate: deletePost, isPending: deletePostIsPending } = useMutation({
    mutationFn: onDeletePosts,
    onSuccess: () => {
      toast.success("Your post has been removed.");

      queryClient.invalidateQueries({
        queryKey: [searchParams.get("filter") ?? "all-levels"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  function handleToggleShowAnnouncementForm() {
    if (role === "admin") setShowAnnouncementForm(!showAnnouncementForm);
  }

  return (
    <section>
      {showAnnouncementForm ? (
        <AnnouncementCreateForm
          handleToggleShowAnnouncementForm={handleToggleShowAnnouncementForm}
          allLevels={allLevels}
        />
      ) : (
        <div className="grid gap-4">
          <FilterLevelPosts options={allLevels} />
          {role === "admin" && (
            <div
              className="flex cursor-pointer items-center gap-4 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 md:p-4"
              onClick={handleToggleShowAnnouncementForm}
            >
              <div className="relative h-9 w-9 flex-shrink-0 rounded-full md:h-12 md:w-12">
                <Image
                  src={
                    "https://crmqyyyvgsrwlpuibjbg.supabase.co/storage/v1/object/public/avatars/school-avatar.jpg?t=2024-10-22T05%3A25%3A48.476Z"
                  }
                  fill
                  alt="image"
                  className="rounded-full"
                />
              </div>
              <p className="text-sm text-[#616572] md:text-base">
                Announce something...
              </p>
            </div>
          )}
          <AnnouncementPostLists
            role={role}
            posts={posts}
            postsIsPending={postsIsPending}
            handleDeletePost={deletePost}
            deletePostIsPending={deletePostIsPending}
          />
        </div>
      )}
    </section>
  );
}
