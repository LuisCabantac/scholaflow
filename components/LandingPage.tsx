"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useRef } from "react";
import { motion } from "motion/react";

import heroLightImage from "@/public/landing_page/hero-light.png";
import heroDarkImage from "@/public/landing_page/hero-dark.png";
import commentAvatar from "@/public/landing_page/comment-avatar.jpg";
import commentImage1 from "@/public/landing_page/comment-1-image.jpg";
import commentAvatar2 from "@/public/landing_page/comment-2-avatar.jpg";
import commentAvatar3 from "@/public/landing_page/comment-3-avatar.jpg";
import commentAvatar4 from "@/public/landing_page/comment-4-avatar.jpg";
import commentAvatar5 from "@/public/landing_page/comment-5-avatar.jpg";
import chatImage1 from "@/public/landing_page/chat-1-image.jpg";
import notesImage1 from "@/public/landing_page/notes-1-image.svg";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const featuresSectionRef = useRef<HTMLDivElement | null>(null);

  function scrollToSection(ref: React.RefObject<HTMLElement | null>) {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  return (
    <main>
      <section className="z-10 flex flex-col items-center gap-10 md:gap-14">
        <div className="flex items-center justify-center gap-4 px-3 pb-10 pt-20 text-center md:px-48 md:pb-10 md:pt-20">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
            <div className="grid gap-3 md:gap-6">
              <motion.h1
                className="text-4xl font-medium tracking-tighter text-foreground md:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Your All-in-One Learning Platform
              </motion.h1>
              <motion.p
                className="px-8 text-center text-foreground/70 md:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                All your classroom tools in one place. Get organized, stay
                focused, and make learning click.
              </motion.p>
            </div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button asChild>
                <Link href="/classroom">Get Started</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => scrollToSection(featuresSectionRef)}
              >
                View features
              </Button>
            </motion.div>
          </div>
        </div>
        <motion.div
          className="flex max-w-4xl items-center justify-center rounded-2xl md:max-w-6xl lg:max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="w-[90%] md:w-full">
            <Image
              src={heroLightImage}
              width={1400}
              height={900}
              placeholder="blur"
              priority
              className="block w-full select-none rounded-2xl object-cover dark:hidden md:shadow-2xl"
              alt="hero image light theme"
              onDragStart={(e) => e.preventDefault()}
            />
            <Image
              src={heroDarkImage}
              width={1400}
              height={900}
              placeholder="blur"
              priority
              className="hidden w-full select-none rounded-2xl object-cover dark:block md:shadow-2xl"
              alt="hero image dark theme"
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </motion.div>
      </section>
      <section className="mx-6 mb-4 mt-20 grid items-center justify-center gap-16 md:mx-10 md:mb-12 md:mt-24 md:gap-14 lg:mx-20">
        <div className="relative mx-auto max-w-xl space-y-6 text-center">
          <motion.h2
            className="text-balance text-3xl font-medium text-foreground lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Simple Steps, Powerful Results
          </motion.h2>
          <motion.p
            className="text-foreground/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            ScholaFlow streamlines your teaching and learning process—just
            create, collaborate, and give feedback. Everything you need, all in
            one place.
          </motion.p>
        </div>
        <div className="grid items-start gap-12 rounded-2xl border bg-card p-6 md:mx-14 md:grid-cols-3 md:p-12">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-start justify-start gap-4">
              <div className="mt-2 shrink-0 rounded-xl bg-foreground/10 p-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 stroke-primary/90"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="m9 14 2 2 4-4" />
                </svg>
              </div>
              <div className="grid gap-2 text-pretty">
                <h4 className="text-lg font-medium leading-tight text-foreground">
                  Create and assign
                </h4>
                <p className="text-sm text-foreground/70">
                  Easily create assignments, share resources, and set deadlines.
                  Quickly set up assignments, attach materials like documents or
                  links, and schedule deadlines to keep your class organized.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-start justify-start gap-4">
              <div className="mt-2 shrink-0 rounded-xl bg-foreground/10 p-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 stroke-primary/90"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </div>
              <div className="grid gap-2 text-pretty">
                <h4 className="text-lg font-medium leading-tight text-foreground">
                  Collaborate and communicate
                </h4>
                <p className="text-sm text-foreground/70">
                  Connect with students through chat or comments for questions
                  and discussions. Use chat and comments to answer questions,
                  share updates, and encourage group discussions.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-start justify-start gap-4">
              <div className="mt-2 shrink-0 rounded-xl bg-foreground/10 p-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 stroke-primary/90"
                >
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                  <circle cx="12" cy="8" r="6" />
                </svg>
              </div>
              <div className="grid gap-2 text-pretty">
                <h4 className="text-lg font-medium leading-tight text-foreground">
                  Grade and feedback
                </h4>
                <p className="text-sm text-foreground/70">
                  Provide timely and helpful feedback while managing classwork
                  grading. Review and grade assignments, leave comments, and
                  help students stay on top of their progress.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section
        ref={featuresSectionRef}
        className="mb-24 grid gap-16 pt-12 md:mx-10 md:gap-24 lg:mx-24"
      >
        <div className="grid w-full items-start gap-x-12 gap-y-4 md:gap-y-24">
          <motion.div
            className="py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                <div className="lg:col-span-2">
                  <div className="md:pr-6 lg:pr-0">
                    <p className="w-fit rounded-xl border bg-foreground/10 px-2 py-1 text-xs text-primary shadow-sm">
                      Make feedback more impactful
                    </p>
                    <h2 className="mt-2 text-3xl font-medium text-foreground md:text-4xl">
                      Visual feedback
                    </h2>
                    <p className="mt-6 text-foreground/70">
                      Streamline your academic workflow with powerful, intuitive
                      tools designed to meet the needs of both students and
                      educators. From feedback to communication, everything you
                      need is built right in.
                    </p>
                  </div>
                </div>
                <div className="relative rounded-3xl border border-border/50 bg-card p-3 lg:col-span-3">
                  <div className="relative overflow-hidden">
                    <div className="h-[20rem]">
                      <div className="h-full overflow-hidden text-pretty rounded-t-2xl border-x border-t">
                        <p className="ml-3 mt-3 text-xs font-medium">
                          Comments
                        </p>
                        <div className="mx-3 mt-1 flex cursor-text items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs text-foreground hover:border-primary/90">
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
                              className="size-4 stroke-primary/90"
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
                          <Image
                            src={commentAvatar2}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 2 avatar"
                          />
                          <div>
                            <p className="mb-0.5 text-xs font-medium">
                              Zachariah Wheeler
                            </p>
                            <p className="text-xs">
                              I&apos;m a bit confused about the light-dependent
                              reactions. I understand they happen in the
                              thylakoid membrane, but I&apos;m not sure about
                              the specific steps and how energy is transferred.
                              Can you clarify?
                            </p>
                          </div>
                        </div>
                        <div className="ml-3 mt-2 flex items-start gap-2">
                          <Image
                            src={commentAvatar}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 1 avatar"
                          />
                          <div>
                            <p className="mb-0.5 text-xs font-medium">
                              Elissa Patrick
                            </p>
                            <p className="text-xs">
                              I think this is related, but I&apos;m not 100%
                              sure.
                            </p>
                            <Image
                              src={commentImage1}
                              width={150}
                              height={150}
                              className="mt-1 w-[10rem] rounded-xl object-cover"
                              alt="comment 1 image"
                            />
                          </div>
                        </div>
                        <div className="ml-3 mt-2 flex items-start gap-2">
                          <Image
                            src={commentAvatar3}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 3 avatar"
                          />
                          <div>
                            <p className="mb-0.5 text-xs font-medium">
                              Lori Cantrell
                            </p>
                            <p className="text-xs">
                              Great question! Let me break it down visually.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                <div className="relative hidden rounded-3xl border border-border/50 bg-card p-3 md:block lg:col-span-3">
                  <div className="relative overflow-hidden">
                    <div className="h-[20rem]">
                      <div className="h-full overflow-hidden text-pretty rounded-t-2xl border-x border-t pr-3">
                        <div className="ml-3 mt-3 grid gap-0.5">
                          <div className="flex">
                            <div className="h-1 w-7"></div>
                            <p className="mb-0.5 text-xs font-medium">
                              Gerald Yoder
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Image
                              src={commentAvatar4}
                              width={24}
                              height={24}
                              className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                              alt="comment 1 avatar"
                            />
                            <p className="rounded-xl border px-2 py-1 text-xs">
                              So the energy is basically being transformed from
                              light to chemical energy?
                            </p>
                          </div>
                        </div>
                        <div className="ml-3 mt-3 grid gap-0.5">
                          <div className="flex">
                            <div className="h-1 w-7"></div>
                            <p className="mb-0.5 text-xs font-medium">
                              Lori Cantrell
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Image
                              src={commentAvatar3}
                              width={24}
                              height={24}
                              className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                              alt="comment 3 avatar"
                            />
                            <p className="rounded-xl border px-2 py-1 text-xs">
                              Exactly!
                            </p>
                          </div>
                          <div className="mt-0.5 flex">
                            <div className="h-1 w-7"></div>
                            <Image
                              src={chatImage1}
                              alt="chat image 1"
                              width={150}
                              height={150}
                              className="w-[12rem] rounded-xl object-cover"
                            />
                          </div>
                          <div className="mt-0.5 flex overflow-hidden">
                            <div className="h-1 w-7"></div>
                            <div className="flex w-full items-center justify-between rounded-xl border px-2 py-2">
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
                                className="hidden size-4 flex-shrink-0 stroke-primary hover:stroke-primary/90 md:block"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-0.5">
                            <div className="flex">
                              <div className="h-1 w-7"></div>
                              <p className="text-xs font-medium">
                                Gerald Yoder
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Image
                                src={commentAvatar4}
                                width={24}
                                height={24}
                                className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                                alt="comment 1 avatar"
                              />
                              <p className="rounded-xl border px-2 py-1 text-xs">
                                Oh, now I see how the energy transfers step by
                                step!
                              </p>
                            </div>
                          </div>
                          <div className="ml-3 mt-3 grid gap-0.5">
                            <div className="flex">
                              <div className="h-1 w-7"></div>
                              <p className="text-xs font-medium">
                                Zachariah Wheeler
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Image
                                src={commentAvatar2}
                                width={24}
                                height={24}
                                className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                                alt="comment 2 avatar h-6 w-6 flex-shrink-0"
                              />
                              <p className="rounded-xl border px-2 py-1 text-xs">
                                Wait, so what exactly happens to those excited
                                electrons? Do they just go back to their
                                original state?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent"></div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="md:pr-6 lg:pr-0">
                    <p className="w-fit rounded-xl border bg-foreground/10 px-2 py-1 text-xs text-primary shadow-sm">
                      All conversations in one place
                    </p>
                    <h2 className="mt-2 text-3xl font-medium text-foreground md:text-4xl">
                      Centralized communication
                    </h2>
                    <p className="mt-6 text-foreground/70">
                      Say goodbye to juggling multiple platforms. With
                      integrated group chat, you can discuss projects, answer
                      questions, and share updates without the distraction of
                      external messaging apps.
                    </p>
                  </div>
                </div>
                <div className="relative rounded-3xl border border-border/50 bg-card p-3 md:hidden lg:col-span-3">
                  <div className="relative overflow-hidden">
                    <div className="h-[20rem]">
                      <div className="h-full overflow-hidden text-pretty rounded-t-2xl border-x border-t pr-3">
                        <div className="ml-3 mt-3 grid gap-0.5">
                          <div className="flex">
                            <div className="h-1 w-7"></div>
                            <p className="mb-0.5 text-xs font-medium">
                              Gerald Yoder
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Image
                              src={commentAvatar4}
                              width={24}
                              height={24}
                              className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                              alt="comment 1 avatar"
                            />
                            <p className="rounded-xl border px-2 py-1 text-xs">
                              So the energy is basically being transformed from
                              light to chemical energy?
                            </p>
                          </div>
                        </div>
                        <div className="ml-3 mt-3 grid gap-0.5">
                          <div className="flex">
                            <div className="h-1 w-7"></div>
                            <p className="mb-0.5 text-xs font-medium">
                              Lori Cantrell
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Image
                              src={commentAvatar3}
                              width={24}
                              height={24}
                              className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                              alt="comment 3 avatar"
                            />
                            <p className="rounded-xl border px-2 py-1 text-xs">
                              Exactly!
                            </p>
                          </div>
                          <div className="mt-0.5 flex">
                            <div className="h-1 w-7"></div>
                            <Image
                              src={chatImage1}
                              alt="chat image 1"
                              width={150}
                              height={150}
                              className="w-[12rem] rounded-xl object-cover"
                            />
                          </div>
                          <div className="mt-0.5 flex overflow-hidden">
                            <div className="h-1 w-7"></div>
                            <div className="flex w-full items-center justify-between rounded-xl border px-2 py-2">
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
                                className="hidden size-4 flex-shrink-0 stroke-primary hover:stroke-primary/90 md:block"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-0.5">
                            <div className="flex">
                              <div className="h-1 w-7"></div>
                              <p className="text-xs font-medium">
                                Gerald Yoder
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Image
                                src={commentAvatar4}
                                width={24}
                                height={24}
                                className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                                alt="comment 1 avatar"
                              />
                              <p className="rounded-xl border px-2 py-1 text-xs">
                                Oh, now I see how the energy transfers step by
                                step!
                              </p>
                            </div>
                          </div>
                          <div className="ml-3 mt-3 grid gap-0.5">
                            <div className="flex">
                              <div className="h-1 w-7"></div>
                              <p className="text-xs font-medium">
                                Zachariah Wheeler
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Image
                                src={commentAvatar2}
                                width={24}
                                height={24}
                                className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                                alt="comment 2 avatar h-6 w-6 flex-shrink-0"
                              />
                              <p className="rounded-xl border px-2 py-1 text-xs">
                                Wait, so what exactly happens to those excited
                                electrons? Do they just go back to their
                                original state?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                <div className="lg:col-span-2">
                  <div className="md:pr-6 lg:pr-0">
                    <p className="w-fit rounded-xl border bg-foreground/10 px-2 py-1 text-xs text-primary shadow-sm">
                      Your thoughts, organized and accessible
                    </p>
                    <h2 className="mt-2 text-3xl font-medium text-foreground md:text-4xl">
                      Personal note hub
                    </h2>
                    <p className="mt-6 text-foreground/70">
                      Capture, organize, and manage your academic thoughts with
                      a built-in note-taking system. Your ideas, always at your
                      fingertips.
                    </p>
                  </div>
                </div>
                <div className="relative rounded-3xl border border-border/50 bg-card p-3 lg:col-span-3">
                  <div className="relative overflow-hidden">
                    <div className="h-[20rem]">
                      <div className="h-full overflow-hidden text-pretty rounded-t-2xl border-x border-t">
                        <div className="ml-3 mt-3 flex flex-col gap-1">
                          <Image
                            src={notesImage1}
                            width={150}
                            height={150}
                            className="w-[12rem] rounded-xl object-cover"
                            alt="notes image 1"
                          />
                          <p className="text-[0.7rem] text-foreground/70">
                            Created about 3 hours ago
                          </p>
                          <h6 className="text-base font-medium text-foreground">
                            Light-dependent reactions
                          </h6>
                        </div>
                        <div className="mx-3 mt-2 grid gap-1">
                          <p className="text-xs text-foreground/90">
                            PSII absorbs a photon to produce a so-called high
                            energy electron which transfers via an electron
                            transport chain to cytochrome b6f and then to PSI.
                            The then-reduced PSI, absorbs another photon
                            producing a more highly reducing electron, which
                            converts NADP+ to NADPH. In oxygenic photosynthesis,
                            the first electron donor is water, creating oxygen
                            (O2) as a by-product. In anoxygenic photosynthesis,
                            various electron donors are used. Cytochrome b6f and
                            ATP synthase work together to produce ATP
                            (photophosphorylation) in two distinct ways. In
                            non-cyclic photophosphorylation, cytochrome b6f uses
                            electrons from PSII and energy from PSI[citation
                            needed] to pump protons from the stroma to the
                            lumen. The resulting proton gradient across the
                            thylakoid membrane creates a proton-motive force,
                            used by ATP synthase to form ATP. In cyclic
                            photophosphorylation, cytochrome b6f uses electrons
                            and energy from PSI to create more ATP and to stop
                            the production of NADPH. Cyclic phosphorylation is
                            important to create ATP and maintain NADPH in the
                            right proportion for the light-independent
                            reactions.
                          </p>
                        </div>
                        <div className="ml-3 mt-2 flex items-start gap-2 pr-3">
                          <Image
                            src={commentAvatar2}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 2 avatar"
                          />
                          <div>
                            <p className="mb-0.5 text-xs font-medium">
                              Zachariah Wheeler
                            </p>
                            <p className="text-xs">
                              I&apos;m a bit confused about the light-dependent
                              reactions. I understand they happen in the
                              thylakoid membrane, but I&apos;m not sure about
                              the specific steps and how energy is transferred.
                              Can you clarify?
                            </p>
                          </div>
                        </div>
                        <div className="ml-3 mt-2 flex items-start gap-2">
                          <Image
                            src={commentAvatar}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 1 avatar"
                          />
                          <div>
                            <p className="mb-0.5 text-xs font-medium">
                              Elissa Patrick
                            </p>
                            <p className="text-xs">
                              I think this is related, but I&apos;m not 100%
                              sure.
                            </p>
                            <Image
                              src={commentImage1}
                              width={150}
                              height={150}
                              className="mt-1 w-[10rem] rounded-xl object-cover"
                              alt="comment 1 image"
                            />
                          </div>
                        </div>
                        <div className="ml-3 mt-2 flex items-start gap-2">
                          <Image
                            src={commentAvatar3}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 3 avatar"
                          />
                          <div>
                            <p className="mb-0.5 text-xs font-medium">
                              Lori Cantrell
                            </p>
                            <p className="text-xs">
                              Great question! Let me break it down visually.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="pt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                <div className="relative hidden rounded-3xl border border-border/50 bg-card p-3 md:block lg:col-span-3">
                  <div className="relative overflow-hidden">
                    <div className="h-[20rem]">
                      <div className="h-full overflow-hidden text-pretty rounded-t-2xl border-x border-t px-3 py-3">
                        <div className="relative h-24 w-full overflow-hidden rounded-xl bg-[#a7adcb] px-2 py-2 text-[#F5F5F5] shadow-sm">
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
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs text-foreground shadow-sm">
                          <Image
                            src={commentAvatar5}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 5 avatar"
                          />
                          <p className="text-foreground/70">
                            Share with your class...
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Green&apos;s Theorem, Stokes&apos; Theorem,
                            Divergence Theorem
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Surface Integrals
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Planes and Lines in 3D Space
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Modeling Real-World Phenomena with Calculus
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Developing a Numerical Method for Integration
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent"></div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="md:pr-6 lg:pr-0">
                    <p className="w-fit rounded-xl border bg-foreground/10 px-2 py-1 text-xs text-primary shadow-sm">
                      Simplified classroom management
                    </p>
                    <h2 className="mt-2 text-3xl font-medium text-foreground md:text-4xl">
                      Familiar yet refined workflow
                    </h2>
                    <p className="mt-6 text-foreground/70">
                      Experience the core functionalities of a learning
                      management system in a way that feels familiar yet more
                      efficient. With an intuitive interface, you&apos;ll
                      navigate through tasks, assignments, and communication
                      with ease. The refined workflow reduces complexity,
                      allowing you to focus on what really matters—managing your
                      classroom effectively without unnecessary distractions.
                    </p>
                  </div>
                </div>
                <div className="relative rounded-3xl border border-border/50 bg-card p-3 md:hidden lg:col-span-3">
                  <div className="relative overflow-hidden">
                    <div className="h-[20rem]">
                      <div className="h-full overflow-hidden text-pretty rounded-t-2xl border-x border-t px-3 py-3">
                        <div className="relative h-24 w-full overflow-hidden rounded-xl bg-[#a7adcb] px-2 py-2 text-[#F5F5F5] shadow-sm">
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
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs text-foreground shadow-sm">
                          <Image
                            src={commentAvatar5}
                            width={24}
                            height={24}
                            className="h-6 w-6 flex-shrink-0 select-none rounded-full"
                            alt="comment 5 avatar"
                          />
                          <p className="text-foreground/70">
                            Share with your class...
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Green&apos;s Theorem, Stokes&apos; Theorem,
                            Divergence Theorem
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Surface Integrals
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Planes and Lines in 3D Space
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Modeling Real-World Phenomena with Calculus
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border px-2 py-2 text-xs font-medium shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4 flex-shrink-0 stroke-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                            />
                          </svg>
                          <p className="text-foreground/70">
                            Developing a Numerical Method for Integration
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card/90 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <motion.section
        className="py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-medium text-foreground md:text-5xl">
              Learning without the hassle
            </h2>
            <p className="mt-4 text-foreground/70">
              Ditch the bloated, overcomplicated platforms. We&apos;re building
              something that just works.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/classroom">Get started for free</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>
      <Footer />
    </main>
  );
}
