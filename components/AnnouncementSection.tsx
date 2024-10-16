"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ILevels } from "@/app/user/announcements/page";

import Button from "@/components/Button";
import Filter from "@/components/Filter";
import AnnouncementForm from "@/components/AnnouncementForm";
import AnnouncementPosts from "@/components/AnnouncementPosts";
import toast from "react-hot-toast";

export interface IPosts {
  id: string;
  author: string;
  created_at: string;
  description: string;
  image: string | null;
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
  hasSchool,
  allLevels,
  handleGetPosts,
  handleDeletePosts,
}: {
  role: string;
  hasSchool: string | null;
  allLevels: ILevels[];
  handleGetPosts: (school: string, levels: string) => Promise<IPosts[] | null>;
  handleDeletePosts: (postId: string) => Promise<void>;
}) {
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [filter, setFilter] = useState("all levels");
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: [filter, hasSchool],
    queryFn: () => handleGetPosts(hasSchool || "", filter),
  });

  const { mutate } = useMutation({
    mutationFn: handleDeletePosts,
    onSuccess: () => {
      toast.success("Your post has been removed.");

      queryClient.invalidateQueries({
        queryKey: [filter],
      });
    },
    onError: (err) => toast.error(err.message),
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
            <Filter handleFilter={handleFilter} />
            {role === "admin" && hasSchool ? (
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

          <AnnouncementPosts
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
