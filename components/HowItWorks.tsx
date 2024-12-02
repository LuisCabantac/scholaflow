import Image from "next/image";

import commentAvatar from "@/public/landing_page/comment-avatar.jpg";
import commentAvatar2 from "@/public/landing_page/comment-2-avatar.jpg";
import commentAvatar3 from "@/public/landing_page/comment-3-avatar.jpg";

export default function HowItWorks() {
  return (
    <section className="mx-6 mb-12 mt-36 grid items-center justify-center gap-6 md:mx-0 md:gap-8">
      <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
        <h2 className="text-3xl font-semibold tracking-tighter md:text-5xl">
          How it works
        </h2>
        <p className="px-10 text-center text-base">
          Manage your classroom with ease in a few simple steps.
        </p>
      </div>
      <div className="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row">
        <div className="relative h-[22rem] w-full overflow-hidden rounded-lg border border-[#dddfe6] bg-[#f5f8ff] shadow-sm md:w-[22rem]">
          <div className="absolute left-4 right-4 top-4 flex flex-col items-start gap-2">
            <p className="rounded-md bg-[#c7d2f1] px-1.5 py-1 text-xs font-medium text-[#384689]">
              01
            </p>
            <h4 className="text-lg font-semibold leading-tight">
              Create and assign
            </h4>
            <p className="text-sm">
              Easily create assignments, share resources, and set deadlines.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-[60%] w-[90%] rounded-tl-md border-l border-t border-[#dddfe6] bg-[#f5f8ff] shadow-sm">
            <h6 className="ml-3 mt-3 text-base font-medium">
              Create assignment
            </h6>
            <p className="ml-3 mt-3 text-xs font-medium">Assign to</p>
            <div className="ml-3 mt-1 cursor-text rounded-l-md border-b border-l border-t border-[#dddfe6] px-3 py-2 text-xs text-[#616572] hover:border-[#384689]">
              All users
            </div>
            <p className="ml-3 mt-3 text-xs font-medium">
              Title<span className="text-red-400"> *</span>
            </p>
            <div className="ml-3 mt-1 cursor-text rounded-l-md border-b border-l border-t border-[#dddfe6] px-3 py-2 text-xs text-[#616572] hover:border-[#384689]">
              Add a descriptive title...
            </div>
            <p className="ml-3 mt-3 text-xs font-medium">Description</p>
            <div className="ml-3 mt-1 cursor-text rounded-l-md border-b border-l border-t border-[#dddfe6] px-3 py-2 text-xs text-[#616572] hover:border-[#384689]">
              Add relevant details or instructions...
            </div>
          </div>
        </div>
        <div className="relative h-[22rem] w-full overflow-hidden rounded-lg border border-[#dddfe6] bg-[#f5f8ff] shadow-sm md:w-[22rem]">
          <div className="absolute left-4 right-4 top-4 flex flex-col items-start gap-2">
            <p className="rounded-md bg-[#c7d2f1] px-1.5 py-1 text-xs font-medium text-[#384689]">
              02
            </p>
            <h4 className="text-lg font-semibold leading-tight">
              Collaborate and communicate
            </h4>
            <p className="text-sm">
              Connect with students through chat or comments for questions and
              discussions.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-[60%] w-[90%] rounded-tl-md border-l border-t border-[#dddfe6] bg-[#f5f8ff]">
            <p className="ml-3 mt-3 text-xs font-medium">Comments</p>
            <div className="ml-3 mt-1 flex cursor-text items-center gap-2 rounded-l-md border-y border-l border-[#dddfe6] py-2 pl-3 text-xs text-[#616572] hover:border-[#384689]">
              Add class comment...
            </div>
            <div className="ml-3 mt-2 flex items-start gap-2">
              <div className="relative h-6 w-6 flex-shrink-0">
                <Image
                  src={commentAvatar}
                  fill
                  className="rounded-full"
                  alt="comment 1 avatar"
                />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium">Elissa Patrick</p>
                <p className="text-xs">
                  Can we include diagrams in our answers, or should it just be
                  text?
                </p>
              </div>
            </div>
            <div className="ml-3 mt-2 flex items-start gap-2">
              <div className="relative h-6 w-6 flex-shrink-0">
                <Image
                  src={commentAvatar2}
                  fill
                  className="rounded-full"
                  alt="comment 2 avatar"
                />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium">Zachariah Wheeler</p>
                <p className="text-xs">
                  I&apos;m a bit confused about the light-dependent reactions. I
                  understand they happen in the thylakoid membrane, but I&apos;m
                  not sure about the specific steps and how energy is
                  transferred. Can you clarify?
                </p>
              </div>
            </div>
            <div className="ml-3 mt-2 flex items-start gap-2">
              <div className="relative h-6 w-6 flex-shrink-0">
                <Image
                  src={commentAvatar3}
                  fill
                  className="rounded-full"
                  alt="comment 3 avatar"
                />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium">Lori Cantrell</p>
                <p className="text-xs">
                  Of course! The light-dependent reactions occur
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-[22rem] w-full overflow-hidden rounded-lg border border-[#dddfe6] bg-[#f5f8ff] shadow-sm md:w-[22rem]">
          <div className="absolute left-4 right-4 top-4 flex flex-col items-start gap-2">
            <p className="rounded-md bg-[#c7d2f1] px-1.5 py-1 text-xs font-medium text-[#384689]">
              03
            </p>
            <h4 className="text-lg font-semibold leading-tight">
              Grade and feedback
            </h4>
            <p className="text-sm">
              Provide timely and helpful feedback while managing classwork
              grading.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-[60%] w-[90%] rounded-tl-md border-l border-t border-[#dddfe6] bg-[#f5f8ff] shadow-sm">
            <div className="ml-3 mt-3 flex justify-between">
              <h6 className="text-base font-medium">Shelby Berry</h6>
              <div className="mr-2 flex items-center gap-1">
                <p className="text-xs">90/100</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 22H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3 mt-4 grid gap-1">
              <p className="text-xs font-medium">Attachments</p>
              <div className="flex items-center gap-2 rounded-l-md border-y border-l border-[#dddfe6] py-2 pl-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                  />
                </svg>
                <p className="text-xs">assignment-1.pdf</p>
              </div>
              <div className="flex items-center gap-2 rounded-l-md border-y border-l border-[#dddfe6] py-2 pl-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                  />
                </svg>
                <p className="text-xs">assignment-2.pdf</p>
              </div>
              <div className="flex items-center gap-2 rounded-l-md border-y border-l border-[#dddfe6] py-2 pl-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
                <p className="text-xs">
                  https://drive.scholaflow.vercel.app/drive/folders/1b1fFaWmvj
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-l-md border-y border-l border-[#dddfe6] py-2 pl-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
                <p className="text-xs">
                  https://drive.scholaflow.vercel.app/drive/folders/4agsxvsfFaWmnbvj
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
