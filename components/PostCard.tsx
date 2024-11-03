"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

import { capitalizeFirstLetter, formatDate } from "@/lib/utils";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { IPost } from "@/components/AnnouncementSection";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import EmblaCarousel from "@/components/EmblaCarousel";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import EllipsisPopover from "@/components/EllipsisPopover";

export default function PostCard({
  post,
  role,
  onPostDelete,
  deletePostIsPending,
}: {
  post: IPost;
  role: string;
  onPostDelete: (id: string) => void;
  deletePostIsPending: boolean;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { useClickOutsideHandler } = useClickOutside();
  const [ellipsis, setEllipsis] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
    handleToggleEllipsis();
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setEllipsis(false);
    },
    false,
  );

  return (
    <li
      className="relative grid w-full grid-cols-[2.5rem_1fr] gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 shadow-sm md:grid-cols-[3rem_1fr] md:p-4"
      id={post.id}
    >
      <div className="relative h-10 w-10 md:h-12 md:w-12">
        <Image
          src={post.schoolAvatar}
          alt={post.schoolName || "school's logo"}
          fill
          className="rounded-full"
        />
      </div>
      <div>
        <div className="flex gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-wrap text-sm font-semibold md:text-base">
                {post.schoolName}
              </p>
              {post.updatedPost && (
                <p className="rounded-md text-xs italic text-[#616572]">
                  Updated
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <p className="text-xs text-[#616572] md:text-sm">
                Author: {post.authorName}
              </p>
              <p>&bull;</p>
              <p className="text-xs text-[#616572] md:text-sm">
                {formatDate(post.created_at)}
              </p>
              {post.levels !== "all-levels" && <p>&bull;</p>}
              <div className="relative">
                {post.levels !== "all-levels" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="size-5 stroke-[#616572]"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                ) : null}
                {showTooltip && post.levels !== "all-levels" && (
                  <div className="absolute -top-8 text-nowrap rounded-md bg-[rgba(33,37,41,0.616)] px-2 py-1 text-xs text-[#fff]">
                    <p>
                      {post.levels !== "all-levels" &&
                        post.levels
                          .split("-")
                          .map((level) => capitalizeFirstLetter(level))
                          .join(" ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {role === "admin" && (
          <div
            className="absolute right-3 top-3 md:right-4 md:top-4"
            ref={wrapperRef}
          >
            <div className="relative">
              <button onClick={handleToggleEllipsis}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                  />
                </svg>
              </button>
              <EllipsisPopover
                showEllipsis={ellipsis}
                editLink={`/user/announcements/edit/${post.id}`}
                onShowConfirmationScreen={handleToggleShowConfirmation}
              />
              {showConfirmation && (
                <ConfirmationScreen
                  type="delete"
                  btnLabel="Delete"
                  isLoading={deletePostIsPending}
                  handleCancel={handleToggleShowConfirmation}
                  handleAction={() => onPostDelete(post.id)}
                >
                  Are you sure you want to delete this post?
                </ConfirmationScreen>
              )}
            </div>
          </div>
        )}
        <p className="mt-1">{post.caption}</p>
        {post.links.length ? (
          <div className="mt-1 grid gap-1">
            <ul
              className={`grid gap-[2px] font-medium ${post.links.length > 1 && "md:grid-cols-2"}`}
            >
              {post.links.map((url, index) => (
                <AttachmentLinkCard
                  key={url}
                  link={url}
                  index={index}
                  location="stream"
                  attachmentAmount={post.links.length}
                />
              ))}
            </ul>
          </div>
        ) : null}
        {post?.image?.length ? <EmblaCarousel slides={post.image} /> : null}
      </div>
    </li>
  );
}
