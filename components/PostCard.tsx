"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/utils";

import { IPosts } from "@/components/AnnouncementSection";
import ConfirmationScreen from "@/components/ConfirmationScreen";

export default function PostCard({
  post,
  role,
  mutate,
}: {
  post: IPosts;
  role: string;
  mutate: (id: string) => void;
}) {
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleSetEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleCloseEllipsis() {
    setEllipsis(false);
  }

  function handleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  return (
    <li
      className="relative flex w-full flex-col gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-4"
      id={post.id}
      onMouseLeave={handleCloseEllipsis}
    >
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="relative h-12 w-12 md:h-16 md:w-16">
            <Image
              src={post.schoolAvatar}
              alt={post.schoolName || "school's logo"}
              fill
            />
          </div>
          <div>
            <p className="text-wrap pr-4 text-sm font-semibold md:text-base">
              {post.schoolName}
            </p>
            <p className="text-xs text-[#616572] md:text-sm">
              Author: {post.authorName}
            </p>

            <div className="flex items-center gap-2">
              <p className="text-xs text-[#616572] md:text-sm">
                {formatDate(post.created_at)}
              </p>
              {post.updatedPost && (
                <p className="rounded-md bg-[#616572] p-1 text-xs text-[#f3f6ff]">
                  Updated
                </p>
              )}
            </div>
          </div>
        </div>
        {role === "admin" && (
          <div className="absolute right-4 top-4">
            <div className="relative">
              <button onClick={handleSetEllipsis}>
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
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </button>
              {ellipsis && (
                <div className="absolute right-0 grid w-[10rem] gap-2 rounded-md bg-[#f3f6ff] p-3 font-medium shadow-md">
                  <Link
                    href={`/user/announcements/edit/${post.id}`}
                    className="flex items-center gap-1 rounded-md text-sm text-[#4c6ef5] hover:text-[#364fc7] md:text-base"
                  >
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                    <span>Edit post</span>
                  </Link>
                  <button
                    onClick={handleShowConfirmation}
                    className="flex items-center gap-1 rounded-md text-sm text-[#f03e3e] hover:text-[#c92a2a] md:text-base"
                  >
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
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
            {showConfirmation && (
              <ConfirmationScreen
                type="delete"
                handleCancel={handleShowConfirmation}
                handleAction={() => mutate(post.id)}
              >
                Are you sure you want to delete this post?
              </ConfirmationScreen>
            )}
          </div>
        )}
      </div>

      <div className="text-base md:text-lg">
        <h4 className="font-semibold">{post.title}</h4>
        <p>{post.description}</p>
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt={post.title || "school's logo"}
          width={0}
          height={0}
          sizes="100%"
          className="h-full w-full rounded-md object-cover"
        />
      )}
    </li>
  );
}
