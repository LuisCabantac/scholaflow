"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

import { ILevels } from "@/app/user/announcements/page";
import { createPost } from "@/lib/announcements-actions";

import Button from "@/components/Button";
import LevelsOption from "@/components/LevelsOption";

export default function AnnouncementForm({
  allLevels,
  handleShowAnnouncementForm,
}: {
  allLevels: ILevels[] | null;
  handleShowAnnouncementForm: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setImagePreviews(newPreviews);
    }
  };

  async function handleCreatePost(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await createPost(formData);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      handleShowAnnouncementForm();
    } else {
      setIsLoading(false);
      toast.error(message);
    }
  }

  return (
    <form
      className="rounded-md border-2 border-[#dbe4ff] p-3 md:p-4"
      onSubmit={handleCreatePost}
    >
      <div className="flex items-center justify-between border-b-2 border-[#dbe4ff] px-2 pb-3 md:pb-4">
        <h3 className="text-lg font-medium md:text-xl">Create post</h3>
        <div>
          <div className="flex gap-1 md:gap-2">
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
      <div className="flex flex-col justify-start gap-3 px-2 py-3 md:py-4">
        <div className="grid gap-1 md:gap-2">
          <label className="text-xs font-medium md:text-sm">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="text"
            name="title"
            className="w-full rounded-md border-2 border-[#bec2cc] bg-[#edf2ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none md:px-5 md:py-3 md:text-base"
            placeholder="Add a title..."
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2">
          <label className="text-xs font-medium md:text-sm">School Level</label>
          <LevelsOption type="post" options={allLevels} isLoading={isLoading} />
        </div>
        <div className="grid gap-1 md:gap-2">
          <label className="text-xs font-medium md:text-sm">
            Description (optional)
          </label>
          <textarea
            name="description"
            className="h-[10rem] resize-none rounded-md border-2 border-[#bec2cc] bg-[#edf2ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none md:px-5 md:py-3 md:text-base"
            placeholder="Add a description..."
            maxLength={255}
            disabled={isLoading}
          ></textarea>
        </div>
        <div className="grid gap-1 md:gap-2">
          <label className="text-xs font-medium md:text-sm">Image</label>
          <div className="w-full">
            <label className="relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[#bec2cc] text-center">
              <input
                type="file"
                name="image"
                accept=".jpg, .jpeg, .png"
                multiple
                className="hidden"
                disabled={isLoading}
                onChange={handleFileChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                className={`size-6 ${imagePreviews.length > 0 ? "stroke-[#384689]" : "stroke-[#bec2cc]"}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                />
              </svg>

              {imagePreviews.length > 0 ? (
                <span className="text-[#384689]">
                  {imagePreviews.length} file
                  {imagePreviews.length > 1 ? "s" : ""} chosen
                </span>
              ) : (
                <span className="text-[#a7abb6]">No chosen file</span>
              )}

              <span
                className={`${imagePreviews.length > 0 ? "text-[#384689]" : "text-[#bec2cc]"} mt-1 text-xs md:text-sm`}
              >
                Drag and drop files here or click to select
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
