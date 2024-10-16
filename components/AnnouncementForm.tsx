"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

import { ILevels } from "@/app/user/announcements/page";
import { createPost } from "@/lib/announcements-actions";

import Button from "@/components/Button";
import LevelsOption from "@/components/LevelsOption";

export default function AnnouncementForm({
  handleShowAnnouncementForm,
  allLevels,
}: {
  handleShowAnnouncementForm: () => void;
  allLevels: ILevels[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreatePost(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await createPost(formData);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      handleShowAnnouncementForm();
    } else toast.error(message);
  }

  return (
    <form
      className="rounded-md border-2 border-[#dbe4ff] p-4"
      onSubmit={handleCreatePost}
    >
      <div className="flex items-center justify-between border-b-2 border-[#dbe4ff] px-2 pb-4">
        <h3 className="text-lg font-medium md:text-xl">Create post</h3>
        <div>
          <div className="flex gap-2">
            {!isLoading && (
              <Button type="secondary" onClick={handleShowAnnouncementForm}>
                Cancel
              </Button>
            )}
            <Button type="primary" isLoading={isLoading}>
              Publish
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start gap-3 px-2 py-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium md:text-base">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            disabled={isLoading}
            required
            type="text"
            name="title"
            className="w-full rounded-md border-2 bg-[#edf2ff] px-4 py-2 focus:outline-2 focus:outline-[#384689] md:px-5 md:py-3"
            placeholder="Add a title..."
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2">
          <label className="text-sm font-medium md:text-base">
            School Level
          </label>
          <LevelsOption allLevels={allLevels} isLoading={isLoading} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium md:text-base">
            Description
          </label>
          <textarea
            disabled={isLoading}
            name="description"
            className="h-[10rem] resize-none rounded-md border-2 bg-[#edf2ff] px-4 py-2 focus:outline-2 focus:outline-[#384689] md:px-5 md:py-3"
            placeholder="Add a description..."
            maxLength={255}
          ></textarea>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium md:text-base">Image</label>
          <input
            disabled={isLoading}
            type="file"
            name="image"
            accept=".jpg, .jpeg, .png"
            className="text-sm file:cursor-pointer file:rounded-md file:border-none file:bg-[#ced8f7] file:px-5 file:py-3 md:text-base"
          />
        </div>
      </div>
    </form>
  );
}
