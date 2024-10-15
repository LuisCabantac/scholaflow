"use client";

import { updatePost } from "@/lib/announcements-actions";

import Button from "@/components/Button";
import LevelsOption from "@/components/LevelsOption";

export default function AnnouncementUpdateForm({
  id,
  title,
  description,
  levels,
}: {
  id: string;
  title: string;
  description: string;
  levels: string;
}) {
  return (
    <form
      className="mt-5 rounded-md border-2 border-[#dbe4ff] p-4"
      action={updatePost}
    >
      <div className="flex items-center justify-between border-b-2 border-[#dbe4ff] px-2 pb-4">
        <h3 className="text-xl font-medium">&quot;{title}&quot;</h3>
        <div>
          <div className="flex gap-2">
            <Button type="secondary" href="/user/announcements">
              Cancel
            </Button>
            <Button type="primary">Update</Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start gap-3 px-2 py-4">
        <div className="grid gap-2">
          <input type="text" value={id} hidden name="id" />
          <label className="font-medium">Title</label>
          <input
            required
            type="text"
            name="title"
            defaultValue={title}
            className="rounded-md border-2 bg-[#edf2ff] px-5 py-3 focus:outline-2 focus:outline-[#384689]"
            placeholder="Edit title..."
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2">
          <label className="font-medium">School Level</label>
          <LevelsOption defaultValue={levels} />
        </div>
        <div className="grid gap-2">
          <label className="font-medium">Description</label>
          <textarea
            required
            name="description"
            defaultValue={description}
            className="h-[10rem] w-full resize-none rounded-md border-2 bg-[#edf2ff] px-5 py-3 focus:outline-2 focus:outline-[#384689]"
            placeholder="Edit description..."
            maxLength={255}
          ></textarea>
        </div>
      </div>
    </form>
  );
}
