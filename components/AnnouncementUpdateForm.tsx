"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { updatePost } from "@/lib/announcements-actions";
import { ILevels } from "@/app/user/announcements/page";

import Button from "@/components/Button";
import LevelsOption from "@/components/LevelsOption";

export default function AnnouncementUpdateForm({
  id,
  title,
  description,
  levels,
  options,
}: {
  id: string;
  title: string;
  description: string;
  levels: string;
  options: ILevels[] | null;
}) {
  const router = useRouter();
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

  async function handleEditPost(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await updatePost(formData);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      router.push("/user/announcements");
    } else toast.error(message);
  }

  return (
    <form
      className="rounded-md border-2 border-[#dbe4ff] p-3 md:p-4"
      onSubmit={handleEditPost}
    >
      <div className="flex items-center justify-between border-b-2 border-[#dbe4ff] px-2 pb-3 md:pb-4">
        <h3 className="text-lg font-medium md:text-xl">&quot;{title}&quot;</h3>
        <div>
          <div className="flex gap-1 md:gap-2">
            {!isLoading && (
              <Button type="secondary" href="/user/announcements">
                Cancel
              </Button>
            )}
            <Button type="primary" isLoading={isLoading}>
              Update
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start gap-3 px-2 py-3 md:py-4">
        <div className="grid gap-1 md:gap-2">
          <input type="text" value={id} hidden name="id" />
          <label className="text-xs font-medium md:text-sm">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            disabled={isLoading}
            required
            type="text"
            name="title"
            defaultValue={title}
            className="rounded-md border-2 border-[#bec2cc] bg-[#edf2ff] px-5 py-3 focus:outline-2 focus:outline-[#384689]"
            placeholder="Edit title..."
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2">
          <label className="text-xs font-medium md:text-sm">School Level</label>
          <LevelsOption
            options={options}
            defaultValue={levels}
            isLoading={isLoading}
          />
        </div>
        <div className="grid gap-1 md:gap-2">
          <label className="text-xs font-medium md:text-sm">
            Description (optional)
          </label>
          <textarea
            disabled={isLoading}
            name="description"
            defaultValue={description}
            className="h-[10rem] w-full resize-none rounded-md border-2 border-[#bec2cc] bg-[#edf2ff] px-5 py-3 focus:outline-2 focus:outline-[#384689]"
            placeholder="Edit description..."
            maxLength={255}
          ></textarea>
        </div>

        <div className="grid gap-1 md:gap-2">
          <label className="text-xs font-medium md:text-sm">Update image</label>
          <div className="w-full">
            <label className="relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[#bec2cc] text-center">
              <input
                type="file"
                name="image"
                accept=".jpg, .jpeg, .png"
                multiple
                disabled={isLoading}
                onChange={handleFileChange}
                className="hidden"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                className="size-6 stroke-[#bec2cc]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                />
              </svg>

              {imagePreviews.length > 0 ? (
                <span className="text-[#a7abb6]">
                  {imagePreviews.length} file
                  {imagePreviews.length > 1 ? "s" : ""} chosen
                </span>
              ) : (
                <span className="text-[#a7abb6]">No chosen file</span>
              )}

              <span className="mt-1 text-xs text-[#bec2cc] md:text-sm">
                Drag and drop files here or click to select
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
