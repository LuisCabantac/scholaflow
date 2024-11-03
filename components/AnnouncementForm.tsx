"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createPost, updatePost } from "@/lib/announcements-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { ILevels } from "@/app/user/announcements/page";

import { IPost } from "@/components/AnnouncementSection";
import Button from "@/components/Button";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import LevelsOption from "@/components/LevelsOption";

export default function AnnouncementForm({
  type,
  post,
  options,
  onToggleShowAnnouncementForm,
}: {
  type: "create" | "edit";
  post?: IPost;
  options: ILevels[] | null;
  onToggleShowAnnouncementForm?: () => void;
}) {
  const router = useRouter();
  const { useClickOutsideHandler } = useClickOutside();
  const addLinkModalWrapperRef = useRef<HTMLDivElement>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    post?.image ?? [],
  );
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [currentUrlLinks, setCurrentUrlLinks] = useState<string[]>(
    post?.links ?? [],
  );
  const [newUrlLinks, setNewUrlLinks] = useState<string[]>([]);
  const [url, setUrl] = useState<string>("");

  async function handleSubmitPost(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    newUrlLinks.forEach((link) => formData.append("links", link));
    newAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );

    if (type === "create") {
      const { success, message } = await createPost(formData);
      if (success) {
        setIsLoading(false);
        toast.success(message);
        onToggleShowAnnouncementForm?.();
      } else {
        setIsLoading(false);
        toast.error(message);
      }
    }

    if (type === "edit") {
      const { success, message } = await updatePost(
        currentUrlLinks,
        currentAttachments,
        formData,
      );
      if (success) {
        setIsLoading(false);
        toast.success(message);
        router.push("/user/announcements");
      } else {
        setIsLoading(false);
        toast.error(message);
      }
    }
  }

  function handleSetNewAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setNewAttachments((prevFiles) => [...prevFiles, ...files]);
    }
  }

  function handleAttachmentNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const newFileNames = Array.from(files).map((file) => file.name);
      setAttachmentNames(newFileNames);
    }
  }

  function handleRemoveCurrentAttachment(index: number) {
    setCurrentAttachments((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleRemoveNewAttachment(index: number) {
    setNewAttachments((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
    setAttachmentNames((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleSetNewUrlLinks(url: string) {
    if (url) {
      setNewUrlLinks([...newUrlLinks, url]);
      setUrl("");
      handleToggleShowAddLinkModal();
    }
  }

  function handleRemoveNewUrl(index: number) {
    setNewUrlLinks((prevFiles) =>
      prevFiles.filter((curlLink, i: number) => i !== index),
    );
  }

  function handleRemoveCurrentUrl(index: number) {
    setCurrentUrlLinks((prevFiles) =>
      prevFiles.filter((curlLink, i: number) => i !== index),
    );
  }

  function handleToggleShowAddLinkModal() {
    setShowAddLinkModal(!showAddLinkModal);
  }

  useClickOutsideHandler(
    addLinkModalWrapperRef,
    () => {
      setShowAddLinkModal(false);
    },
    isLoading,
  );

  return (
    <form
      className="rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] shadow-sm"
      onSubmit={handleSubmitPost}
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-6">
        <h3 className="text-lg font-medium md:text-xl">
          {type === "edit" && post
            ? `Edit post: "${
                post.caption.length > 25
                  ? post.caption.slice(0, 25).concat("...")
                  : post.caption
              }"`
            : "Create post"}
        </h3>
      </div>

      <div className="flex flex-col justify-start gap-3 px-4 pb-4 md:px-6 md:pb-6">
        <input type="text" value={post?.id ?? ""} hidden name="postId" />

        <div className="flex flex-col items-start justify-start gap-2">
          <label className="text-xs font-medium md:text-sm">School Level</label>
          <LevelsOption
            type="post"
            options={options}
            defaultValue={post?.levels ?? "all-levels"}
            isLoading={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium md:text-sm">
            Caption <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            name="caption"
            disabled={isLoading}
            defaultValue={post?.caption ?? ""}
            className="h-[10rem] w-full resize-none rounded-md border-2 border-[#dbe4ff] bg-transparent px-5 py-3 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
            placeholder="Edit caption..."
            maxLength={255}
          ></textarea>
        </div>
        <div className="flex gap-2 md:gap-4">
          <label className="input__file__label flex cursor-pointer gap-1">
            <input
              type="file"
              multiple
              accept=".jpg, .jpeg, .png .webp, .svg"
              className="input__file hidden disabled:cursor-not-allowed"
              disabled={isLoading}
              onChange={(event) => {
                handleAttachmentNameChange(event);
                handleSetNewAttachment(event);
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="size-5 stroke-[#616572]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-xs font-medium md:text-sm">Upload files</p>
          </label>

          <label className="flex gap-1">
            <button
              onClick={handleToggleShowAddLinkModal}
              className="flex gap-1"
              type="button"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5 stroke-[#616572]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
              <p className="text-xs font-medium md:text-sm">Add links</p>
            </button>
          </label>
          {showAddLinkModal && (
            <div className="confirmation__container">
              <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
                <div
                  className="grid w-full gap-2 rounded-md bg-[#f3f6ff] p-4 md:w-[25rem]"
                  ref={addLinkModalWrapperRef}
                >
                  <div className="grid gap-2">
                    <h4 className="text-lg font-medium">Add link</h4>
                    <input
                      type="text"
                      className="w-full rounded-md border-2 bg-transparent px-5 py-3 focus:border-[#384689] focus:outline-none"
                      placeholder="Enter a url..."
                      required
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="secondary"
                      onClick={handleToggleShowAddLinkModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleSetNewUrlLinks(url)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-1 md:gap-2">
          {currentAttachments.length || attachmentNames.length ? (
            <label className="text-xs font-medium md:text-sm">Images</label>
          ) : null}
          <ul className="grid gap-2">
            {attachmentNames.length
              ? attachmentNames.map((file, index) => (
                  <AttachmentFileCard
                    file={file}
                    index={index}
                    type="newFile"
                    location="form"
                    isLoading={isLoading}
                    onRemoveAttachment={handleRemoveNewAttachment}
                    key={file}
                  />
                ))
              : null}
            {currentAttachments.length
              ? currentAttachments.map((file, index) => (
                  <AttachmentFileCard
                    file={file}
                    index={index}
                    type="curFile"
                    location="form"
                    isLoading={isLoading}
                    onRemoveAttachment={handleRemoveCurrentAttachment}
                    key={file}
                  />
                ))
              : null}
          </ul>
        </div>
        <div className="grid gap-1 md:gap-2">
          {currentUrlLinks.length || newUrlLinks.length ? (
            <label className="text-xs font-medium md:text-sm">Links</label>
          ) : null}
          <ul className="grid gap-2">
            {newUrlLinks.length
              ? newUrlLinks.map((link, index) => (
                  <AttachmentLinkCard
                    link={link}
                    index={index}
                    location="form"
                    isLoading={isLoading}
                    onRemoveAttachment={handleRemoveNewUrl}
                    key={link}
                  />
                ))
              : null}
            {currentUrlLinks.length
              ? currentUrlLinks.map((link, index) => (
                  <AttachmentLinkCard
                    link={link}
                    index={index}
                    location="form"
                    isLoading={isLoading}
                    onRemoveAttachment={handleRemoveCurrentUrl}
                    key={link}
                  />
                ))
              : null}
          </ul>
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          {!isLoading && type === "edit" && (
            <Button type="secondary" href="/user/announcements">
              Cancel
            </Button>
          )}
          {!isLoading && type === "create" && (
            <Button type="secondary" onClick={onToggleShowAnnouncementForm}>
              Cancel
            </Button>
          )}
          <Button type="primary" isLoading={isLoading}>
            {type === "edit" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
