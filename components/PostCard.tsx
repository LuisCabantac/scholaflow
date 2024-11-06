"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Linkify from "react-linkify";

import { capitalizeFirstLetter, formatDate } from "@/lib/utils";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { ILevels } from "@/app/user/announcements/page";

import { IPost } from "@/components/AnnouncementSection";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import EmblaCarousel from "@/components/EmblaCarousel";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import EllipsisPopover from "@/components/EllipsisPopover";
import AnnouncementForm from "@/components/AnnouncementForm";

export default function PostCard({
  post,
  role,
  options,
  onPostDelete,
  deletePostIsPending,
}: {
  post: IPost;
  role: string;
  options: ILevels[] | null;
  onPostDelete: (id: string) => void;
  deletePostIsPending: boolean;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { useClickOutsideHandler } = useClickOutside();
  const [ellipsis, setEllipsis] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [seeMore, setSeeMore] = useState(false);

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
    handleToggleEllipsis();
  }

  function handleToggleShowAnnouncementForm() {
    if (role === "admin") setShowAnnouncementForm(!showAnnouncementForm);
  }

  function handleToggleSeeMore() {
    setSeeMore(!seeMore);
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setEllipsis(false);
    },
    false,
  );

  function captionLinksDecorator(href: string, text: string, key: number) {
    return (
      <a
        href={href}
        key={key}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#5c7cfa", textDecoration: "underline" }}
      >
        {text}
      </a>
    );
  }

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
            <p className="text-wrap text-sm font-semibold md:text-base">
              {post.schoolName}
            </p>

            <div className="flex items-center gap-1">
              <p className="text-xs text-[#616572] md:text-sm">
                Author: {post.authorName}
              </p>
              <p>&bull;</p>
              <p className="text-xs text-[#616572] md:text-sm">
                {formatDate(post.created_at)}
              </p>
              {post.updatedPost && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              )}
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
                showEdit={true}
                showEllipsis={ellipsis}
                onShowEditForm={handleToggleShowAnnouncementForm}
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
        <Linkify componentDecorator={captionLinksDecorator}>
          <p className="mt-1 hidden whitespace-pre-line md:block">
            {post.caption}
          </p>
          {seeMore ? (
            <p className="mt-1 block whitespace-pre-line md:hidden">
              {post.caption}
            </p>
          ) : (
            <p className="mt-1 block whitespace-pre-line md:hidden">
              {post.caption.length > 80
                ? post.caption.slice(0, 80).concat("...")
                : post.caption}
              {post.caption.length > 80 && (
                <span
                  className="cursor-pointer text-[#616572]"
                  onClick={handleToggleSeeMore}
                >
                  {" "}
                  See more
                </span>
              )}
            </p>
          )}
        </Linkify>
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
      {showAnnouncementForm && (
        <div className="confirmation__container">
          <div className="flex w-[90%] items-center justify-center md:w-[80%]">
            <AnnouncementForm
              type="edit"
              post={post}
              options={options}
              onToggleShowAnnouncementForm={handleToggleShowAnnouncementForm}
            />
          </div>
        </div>
      )}
    </li>
  );
}
