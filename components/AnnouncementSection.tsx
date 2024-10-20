"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ILevels } from "@/app/user/announcements/page";

import Button from "@/components/Button";
import Filter from "@/components/Filter";
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
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [filter, setFilter] = useState("all levels");
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: [filter],
    queryFn: () => onGetPosts(filter),
  });

  const { mutate } = useMutation({
    mutationFn: onDeletePosts,
    onSuccess: () => {
      toast.success("Your post has been removed.");

      queryClient.invalidateQueries({
        queryKey: [filter],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  function handleShowAnnouncementForm() {
    if (role === "admin") setShowAnnouncementForm(!showAnnouncementForm);
  }

  function handleFilter(event: React.ChangeEvent<HTMLSelectElement>) {
    setFilter(event.target.value.toLowerCase());
  }

  return (
    <>
      {!showAnnouncementForm ? (
        <>
          <div className="flex items-center justify-between pb-4">
            <Filter options={allLevels} handleFilter={handleFilter} />
            {role === "admin" ? (
              <Button type="primary" onClick={handleShowAnnouncementForm}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 md:size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>Create post</span>
              </Button>
            ) : null}
          </div>

          <AnnouncementPostLists
            role={role}
            posts={posts}
            isLoading={isLoading}
            mutate={mutate}
          />
        </>
      ) : (
        <AnnouncementForm
          handleShowAnnouncementForm={handleShowAnnouncementForm}
          allLevels={allLevels}
        />
      )}
    </>
  );
}
