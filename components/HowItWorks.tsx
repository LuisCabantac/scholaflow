import * as motion from "framer-motion/client";
import Image from "next/image";

import { fadeInUp } from "@/app/page";
import commentAvatar from "@/public/landing_page/comment-avatar.jpg";

export default function HowItWorks() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1, transition: { straggerChildren: 0.2 } }}
      viewport={{ amount: "all", once: true }}
      className="mx-6 my-24 grid gap-6 md:mx-32"
    >
      <motion.div
        variants={fadeInUp}
        className="flex flex-col items-center justify-center gap-1"
      >
        <h2 className="text-2xl font-semibold tracking-tighter md:text-4xl">
          How it works
        </h2>
        <p className="px-10 text-center text-base">
          Manage your classroom with ease in a few simple steps.
        </p>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        className="grid h-[56rem] gap-6 md:h-[18rem] md:grid-cols-3"
      >
        <div className="relative rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] shadow-sm">
          <div className="absolute left-4 right-4 top-4 flex flex-col items-start gap-2">
            <p className="rounded-md bg-[#c7d2f1] px-1.5 py-1 text-xs font-medium text-[#384689]">
              01
            </p>
            <h4 className="text-base font-semibold">Create and assign</h4>
            <p className="text-sm">
              Easily create assignments, share resources, and set deadlines.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-[50%] w-[90%] rounded-tl-md border-l border-t border-[#dbe4ff] bg-[#f5f8ff] shadow-sm">
            <h6 className="ml-3 mt-3 text-base font-medium">
              Create assignment
            </h6>
            <p className="ml-3 mt-3 text-xs font-medium">Assign to</p>
            <div className="ml-3 mt-1 h-8 rounded-l-sm border-b border-l border-t border-[#dbe4ff] px-3 py-2 text-xs text-[#616572]">
              All users
            </div>
            <p className="ml-3 mt-3 text-xs font-medium">Title</p>
            <div className="ml-3 mt-1 h-3.5 rounded-tl-sm border-l border-t border-[#dbe4ff] md:h-3"></div>
          </div>
        </div>
        <div className="relative rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] shadow-sm">
          <div className="absolute left-4 right-4 top-4 flex flex-col items-start gap-2">
            <p className="rounded-md bg-[#c7d2f1] px-1.5 py-1 text-xs font-medium text-[#384689]">
              02
            </p>
            <h4 className="text-base font-semibold">
              Collaborate and communicate
            </h4>
            <p className="text-sm">
              Connect with students through chat or comments for questions and
              discussions.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-[50%] w-[90%] rounded-tl-md border-l border-t border-[#dbe4ff] bg-[#f5f8ff] shadow-sm">
            <p className="ml-3 mt-3 text-xs font-medium">Comments</p>
            <div className="ml-3 mt-1 flex items-center gap-2 rounded-l-sm border-y border-l border-[#dbe4ff] py-2 pl-3 text-xs text-[#616572]">
              Add class comment...
            </div>
            <div className="ml-3 mt-2 flex items-start gap-2">
              <div className="relative h-6 w-6 flex-shrink-0">
                <Image
                  src={commentAvatar}
                  fill
                  className="rounded-full"
                  alt="comment avatar"
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
          </div>
        </div>
        <div className="relative rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] shadow-sm">
          <div className="absolute left-4 right-4 top-4 flex flex-col items-start gap-2">
            <p className="rounded-md bg-[#c7d2f1] px-1.5 py-1 text-xs font-medium text-[#384689]">
              03
            </p>
            <h4 className="text-base font-semibold">Grade and feedback</h4>
            <p className="text-sm">
              Provide timely and helpful feedback while managing classwork
              grading.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-[50%] w-[90%] rounded-tl-md border-l border-t border-[#dbe4ff] bg-[#f5f8ff] shadow-sm">
            <div className="ml-3 mt-3 flex justify-between">
              <h6 className="text-base font-semibold">John Doe</h6>
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3 mt-4 grid gap-1">
              <p className="text-xs font-medium">Attachments</p>
              <div className="flex h-8 items-center gap-2 rounded-l-sm border-y border-l border-[#dbe4ff] py-2 pl-2">
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
              <div className="flex h-8 items-center gap-2 rounded-l-sm border-y border-l border-[#dbe4ff] py-2 pl-2">
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
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
