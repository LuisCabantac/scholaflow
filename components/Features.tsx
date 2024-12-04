import React from "react";
import Image from "next/image";

import commentAvatar from "@/public/landing_page/comment-avatar.jpg";
import commentImage1 from "@/public/landing_page/comment-1-image.png";
import commentAvatar2 from "@/public/landing_page/comment-2-avatar.jpg";
import commentAvatar3 from "@/public/landing_page/comment-3-avatar.jpg";
import commentAvatar4 from "@/public/landing_page/comment-4-avatar.jpg";
import commentAvatar5 from "@/public/landing_page/comment-5-avatar.jpg";
import chatImage1 from "@/public/landing_page/chat-1-image.jpeg";
import notesImage1 from "@/public/landing_page/notes-1-image.svg";

export default function Features({
  featuresSectionRef,
}: {
  featuresSectionRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      ref={featuresSectionRef}
      className="mx-8 mb-24 grid gap-16 pt-12 md:mx-10 md:gap-24"
    >
      <h2 className="text-center text-[#616572]">Features</h2>
      <div className="grid w-full items-start gap-x-12 gap-y-4 md:grid-cols-2 md:gap-y-24">
        <div className="flex flex-col items-start gap-2">
          <p className="rounded-md border bg-[#c7d2f1] px-2 py-1 text-xs text-[#384689] shadow-sm">
            Make feedback more impactful
          </p>
          <h4 className="text-3xl font-medium md:text-4xl">Visual feedback</h4>
          <p>
            Streamline your academic workflow with powerful, intuitive tools
            designed to meet the needs of both students and educators. From
            feedback to communication, everything you need is built right in.
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div className="h-[20rem]">
            <div className="h-full overflow-hidden text-pretty rounded-t-md border-x border-t border-[#dddfe6] bg-[#f5f8ff]">
              <p className="ml-3 mt-3 text-xs font-medium">Comments</p>
              <div className="mx-3 mt-1 flex cursor-text items-center justify-between gap-2 rounded-md border border-[#dddfe6] px-3 py-2 text-xs text-[#616572] hover:border-[#384689]">
                <span>Add class comment...</span>
                <div className="flex items-center gap-2">
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
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-4 stroke-[#384689]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 mt-2 flex items-start gap-2 pr-3">
                <div className="relative h-6 w-6 flex-shrink-0">
                  <Image
                    src={commentAvatar2}
                    fill
                    className="rounded-full"
                    alt="comment 2 avatar"
                  />
                </div>
                <div>
                  <p className="mb-0.5 text-xs font-medium">
                    Zachariah Wheeler
                  </p>
                  <p className="text-xs">
                    I&apos;m a bit confused about the light-dependent reactions.
                    I understand they happen in the thylakoid membrane, but
                    I&apos;m not sure about the specific steps and how energy is
                    transferred. Can you clarify?
                  </p>
                </div>
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
                    I think this is related, but I&apos;m not 100% sure.
                  </p>
                  <Image
                    src={commentImage1}
                    width={500}
                    height={500}
                    className="mt-1 w-[10rem] rounded-md object-cover"
                    alt="comment 1 image"
                  />
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
                    Great question! Let me break it down visually.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#edf2ff]/50 to-transparent"></div>
        </div>
        <div className="mt-12 flex flex-col items-start gap-2 md:order-2 md:mt-0">
          <p className="rounded-md border bg-[#c7d2f1] px-2 py-1 text-xs text-[#384689] shadow-sm">
            All conversations in one place
          </p>
          <h4 className="text-3xl font-medium md:text-4xl">
            Centralized communication
          </h4>
          <p>
            Say goodbye to juggling multiple platforms. With integrated group
            chat, you can discuss projects, answer questions, and share updates
            without the distraction of external messaging apps.
          </p>
        </div>
        <div className="relative overflow-hidden md:order-1">
          <div className="h-[20rem]">
            <div className="h-full overflow-hidden text-pretty rounded-t-md border-x border-t border-[#dddfe6] bg-[#f5f8ff] pr-3">
              <div className="ml-3 mt-3 grid gap-0.5">
                <div className="flex">
                  <div className="h-1 w-7"></div>
                  <p className="text-xs font-medium">Gerald Yoder</p>
                </div>
                <div className="flex gap-1">
                  <div className="relative h-6 w-6 flex-shrink-0">
                    <Image
                      src={commentAvatar4}
                      fill
                      className="rounded-full"
                      alt="comment 1 avatar"
                    />
                  </div>
                  <p className="rounded-md border border-[#dddfe6] px-2 py-1 text-xs">
                    So the energy is basically being transformed from light to
                    chemical energy?
                  </p>
                </div>
              </div>
              <div className="ml-3 mt-3 grid gap-0.5">
                <div className="flex">
                  <div className="h-1 w-7"></div>
                  <p className="mb-0.5 text-xs font-medium">Lori Cantrell</p>
                </div>
                <div className="flex gap-1">
                  <div className="relative h-6 w-6 flex-shrink-0">
                    <Image
                      src={commentAvatar3}
                      fill
                      className="rounded-full"
                      alt="comment 3 avatar"
                    />
                  </div>
                  <p className="rounded-md border border-[#dddfe6] px-2 py-1 text-xs">
                    Exactly!
                  </p>
                </div>
                <div className="mt-0.5 flex">
                  <div className="h-1 w-7"></div>
                  <Image
                    src={chatImage1}
                    alt="chat image 1"
                    width={500}
                    height={500}
                    className="w-[12rem] rounded-md object-cover"
                  />
                </div>
                <div className="mt-0.5 flex overflow-hidden">
                  <div className="h-1 w-7"></div>
                  <div className="flex w-full items-center justify-between rounded-md border border-[#dddfe6] px-2 py-2">
                    <div className="flex w-full items-center gap-2 overflow-hidden">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="hidden size-4 md:block"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                        />
                      </svg>
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                        Electron_Transport_Chain_Diagram.pdf
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      className="hidden size-4 flex-shrink-0 stroke-[#22317c] hover:stroke-[#384689] md:block"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 mt-3 grid gap-0.5">
                  <div className="flex">
                    <div className="h-1 w-7"></div>
                    <p className="text-xs font-medium">Gerald Yoder</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="relative h-6 w-6 flex-shrink-0">
                      <Image
                        src={commentAvatar4}
                        fill
                        className="rounded-full"
                        alt="comment 1 avatar"
                      />
                    </div>
                    <p className="rounded-md border border-[#dddfe6] px-2 py-1 text-xs">
                      Oh, now I see how the energy transfers step by step!
                    </p>
                  </div>
                </div>
                <div className="ml-3 mt-3 grid gap-0.5">
                  <div className="flex">
                    <div className="h-1 w-7"></div>
                    <p className="text-xs font-medium">Zachariah Wheeler</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="relative h-6 w-6 flex-shrink-0">
                      <Image
                        src={commentAvatar2}
                        fill
                        className="rounded-full"
                        alt="comment 2 avatar"
                      />
                    </div>
                    <p className="rounded-md border border-[#dddfe6] px-2 py-1 text-xs">
                      Wait, so what exactly happens to those excited electrons?
                      Do they just go back to their original state?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#edf2ff]/50 to-transparent"></div>
        </div>
        <div className="mt-12 flex flex-col items-start gap-2 md:order-1 md:mt-0">
          <p className="rounded-md border bg-[#c7d2f1] px-2 py-1 text-xs text-[#384689] shadow-sm">
            Your thoughts, organized and accessible
          </p>
          <h4 className="text-3xl font-medium md:text-4xl">
            Personal note hub
          </h4>
          <p>
            Capture, organize, and manage your academic thoughts with a built-in
            note-taking system. Your ideas, always at your fingertips.
          </p>
        </div>
        <div className="relative overflow-hidden md:order-2">
          <div className="h-[20rem]">
            <div className="h-full overflow-hidden text-pretty rounded-t-md border-x border-t border-[#dddfe6] bg-[#f5f8ff]">
              <div className="ml-3 mt-3 flex flex-col gap-1">
                <Image
                  src={notesImage1}
                  width={500}
                  height={500}
                  className="w-[12rem] rounded-md object-cover"
                  alt="notes image 1"
                />
                <p className="text-[0.7rem] text-[#616572]">
                  Created about 3 hours ago
                </p>
                <h6 className="text-base font-medium">
                  Light-dependent reactions
                </h6>
              </div>
              <div className="mx-3 mt-2 grid gap-1">
                <p className="text-xs">
                  PSII absorbs a photon to produce a so-called high energy
                  electron which transfers via an electron transport chain to
                  cytochrome b6f and then to PSI. The then-reduced PSI, absorbs
                  another photon producing a more highly reducing electron,
                  which converts NADP+ to NADPH. In oxygenic photosynthesis, the
                  first electron donor is water, creating oxygen (O2) as a
                  by-product. In anoxygenic photosynthesis, various electron
                  donors are used. Cytochrome b6f and ATP synthase work together
                  to produce ATP (photophosphorylation) in two distinct ways. In
                  non-cyclic photophosphorylation, cytochrome b6f uses electrons
                  from PSII and energy from PSI[citation needed] to pump protons
                  from the stroma to the lumen. The resulting proton gradient
                  across the thylakoid membrane creates a proton-motive force,
                  used by ATP synthase to form ATP. In cyclic
                  photophosphorylation, cytochrome b6f uses electrons and energy
                  from PSI to create more ATP and to stop the production of
                  NADPH. Cyclic phosphorylation is important to create ATP and
                  maintain NADPH in the right proportion for the
                  light-independent reactions.
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#edf2ff]/50 to-transparent"></div>
        </div>
        <div className="mt-12 flex flex-col items-start gap-2 md:order-4 md:mt-0">
          <p className="rounded-md border bg-[#c7d2f1] px-2 py-1 text-xs text-[#384689] shadow-sm">
            Simplified classroom management
          </p>
          <h4 className="text-3xl font-medium md:text-4xl">
            Familiar yet refined workflow
          </h4>
          <p>
            Experience the core functionalities of a learning management system
            in a way that feels familiar yet more efficient. With an intuitive
            interface, you&apos;ll navigate through tasks, assignments, and
            communication with ease. The refined workflow reduces complexity,
            allowing you to focus on what really matters—managing your classroom
            effectively without unnecessary distractions.
          </p>
        </div>
        <div className="relative overflow-hidden md:order-3">
          <div className="h-[20rem]">
            <div className="h-full overflow-hidden text-pretty rounded-t-md border-x border-t border-[#dddfe6] bg-[#f5f8ff] px-3 py-3">
              <div className="relative h-24 w-full overflow-hidden rounded-md bg-[#a7adcb] px-2 py-2 text-[#F5F5F5] shadow-sm">
                <p className="w-[70%] overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold md:w-full">
                  Calculus and Analytical Geometry
                </p>
                <p className="font-medium">MATH 141-A · 001</p>
                <div className="absolute bottom-5 right-4 md:bottom-2 md:right-3">
                  <svg
                    viewBox="0 0 64 64"
                    className="w-14 -rotate-45 mix-blend-overlay"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeMiterlimit={10}
                      strokeWidth={2}
                      d="M1 1h46v62H1zM9 63V2M14 15h28M14 21h28M63 3v50l-4 8-4-8V3zM55 7h-4v10"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border px-2 py-2 text-xs text-[#616572] shadow-sm">
                <div className="relative h-6 w-6 flex-shrink-0">
                  <Image
                    src={commentAvatar5}
                    fill
                    className="rounded-full"
                    alt="comment 5 avatar"
                  />
                </div>
                <p>Share with your class...</p>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border px-2 py-2 text-xs font-medium shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 flex-shrink-0 stroke-[#5c7cfa]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                  />
                </svg>
                <p>
                  Green&apos;s Theorem, Stokes&apos; Theorem, Divergence Theorem
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border px-2 py-2 text-xs font-medium shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 flex-shrink-0 stroke-[#5c7cfa]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                  />
                </svg>
                <p>Surface Integrals</p>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border px-2 py-2 text-xs font-medium shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 flex-shrink-0 stroke-[#5c7cfa]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                  />
                </svg>
                <p>Planes and Lines in 3D Space</p>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border px-2 py-2 text-xs font-medium shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 flex-shrink-0 stroke-[#5c7cfa]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                  />
                </svg>
                <p>Modeling Real-World Phenomena with Calculus</p>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md border px-2 py-2 text-xs font-medium shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 flex-shrink-0 stroke-[#5c7cfa]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                  />
                </svg>
                <p>Developing a Numerical Method for Integration</p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#edf2ff]/50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
