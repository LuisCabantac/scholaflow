"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import { ILevels } from "@/app/user/announcements/page";
import { createPost } from "@/lib/announcements-actions";

import Button from "@/components/Button";
import LevelsOption from "@/components/LevelsOption";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import AttachmentLinkCard from "./AttachmentLinkCard";
import AttachmentFileCard from "./AttachmentFileCard";

export default function AnnouncementCreateForm({
  allLevels,
  handleToggleShowAnnouncementForm,
}: {
  allLevels: ILevels[] | null;
  handleToggleShowAnnouncementForm: () => void;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const addLinkModalWrapperRef = useRef<HTMLDivElement>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [postAttachments, setPostAttachments] = useState<File[]>([]);
  const [urlLinks, setUrlLinks] = useState<string[]>([]);
  const [url, setUrl] = useState<string>("");

  async function handleCreatePost(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    urlLinks.forEach((link) => formData.append("links", link));
    postAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    const { success, message } = await createPost(formData);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      handleToggleShowAnnouncementForm();
    } else {
      setIsLoading(false);
      toast.error(message);
    }
  }

  function handleSetPostAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setPostAttachments((prevFiles) => [...prevFiles, ...files]);
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

  function handleRemoveAttachment(index: number) {
    setPostAttachments((prevFiles) =>
      prevFiles.filter((curFile, i: number) => i !== index),
    );
    setAttachmentNames((prevFiles) =>
      prevFiles.filter((curFile, i: number) => i !== index),
    );
  }

  function handleSetUrlLinks(url: string) {
    if (url) {
      setUrlLinks([...urlLinks, url]);
      setUrl("");
      handleToggleShowAddLinkModal();
    }
  }

  function handleRemoveUrl(index: number) {
    setUrlLinks((prevFiles) =>
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
      className="rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 md:p-4"
      onSubmit={handleCreatePost}
    >
      <div className="flex items-center justify-between border-b-2 border-[#dbe4ff] px-2 pb-3 md:pb-4">
        <h3 className="text-lg font-medium md:text-xl">Create post</h3>
      </div>
      <div className="flex flex-col justify-start gap-3 px-2 py-3 md:py-4">
        <div className="flex flex-col items-start justify-start gap-2">
          <label className="text-xs font-medium md:text-sm">School Level</label>
          <LevelsOption type="post" options={allLevels} isLoading={isLoading} />
        </div>
        <div className="grid gap-1 md:gap-2">
          <label className="text-xs font-medium md:text-sm">
            Caption <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            name="caption"
            disabled={isLoading}
            className="h-[10rem] resize-none rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 text-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
            placeholder="Add a caption..."
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
                handleSetPostAttachment(event);
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
                d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
              />
            </svg>
            <p className="text-xs font-medium md:text-sm">Upload files</p>
          </label>
          <label>
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
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
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
                  <div className="flex justify-end gap-1">
                    <Button
                      type="secondary"
                      onClick={handleToggleShowAddLinkModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleSetUrlLinks(url)}
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
          {attachmentNames.length ? (
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
                    onRemoveAttachment={handleRemoveAttachment}
                    key={file}
                  />
                ))
              : null}
          </ul>
        </div>
        <div className="grid gap-1 md:gap-2">
          {urlLinks.length ? (
            <label className="text-xs font-medium md:text-sm">Links</label>
          ) : null}
          <ul className="grid gap-2">
            {urlLinks.length
              ? urlLinks.map((url, index) => (
                  <AttachmentLinkCard
                    key={url}
                    link={url}
                    index={index}
                    location="form"
                    isLoading={isLoading}
                    onRemoveAttachment={handleRemoveUrl}
                  />
                ))
              : null}
          </ul>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 md:gap-2">
          {!isLoading && (
            <Button type="secondary" onClick={handleToggleShowAnnouncementForm}>
              Cancel
            </Button>
          )}
          <Button type="primary" isLoading={isLoading}>
            Publish
          </Button>
        </div>
      </div>
    </form>
  );
}
