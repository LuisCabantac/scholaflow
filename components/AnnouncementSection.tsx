"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ILevels } from "@/app/user/announcements/page";

import FilterLevelPosts from "@/components/FilterLevelPosts";
import AnnouncementForm from "@/components/AnnouncementForm";
import AnnouncementPostLists from "@/components/AnnouncementPostLists";

export interface IPosts {
  id: string;
  author: string;
  created_at: string;
  description: string;
  image: string[] | null;
  linkUrl: string | null;
  school: string;
  schoolAvatar: string;
  schoolName: string | null;
  authorName: string | null;
  levels: string;
  title: string;
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
  onGetPosts: (levels: string) => Promise<IPosts[] | null>;
  onDeletePosts: (postId: string) => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: [searchParams.get("filter") ?? "all-levels"],
    queryFn: () => onGetPosts(searchParams.get("filter") ?? "all-levels"),
  });

  const { mutate } = useMutation({
    mutationFn: onDeletePosts,
    onSuccess: () => {
      toast.success("Your post has been removed.");

      queryClient.invalidateQueries({
        queryKey: [searchParams.get("filter") ?? "all-levels"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  function handleShowAnnouncementForm() {
    if (role === "admin") setShowAnnouncementForm(!showAnnouncementForm);
  }

  return (
    <section>
      {showAnnouncementForm ? (
        <AnnouncementForm
          handleShowAnnouncementForm={handleShowAnnouncementForm}
          allLevels={allLevels}
        />
      ) : (
        <div className="grid gap-4">
          <FilterLevelPosts options={allLevels} />
          {role === "admin" && (
            <div
              className="flex cursor-pointer items-center gap-4 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 md:p-4"
              onClick={handleShowAnnouncementForm}
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
            isLoading={isLoading}
            mutate={mutate}
          />
        </div>
      )}
    </section>
  );
}
