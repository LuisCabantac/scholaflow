"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ISession } from "@/lib/auth";
import { joinClass } from "@/lib/classroom-actions";

import { IClass } from "@/components/ClassroomSection";
import SpinnerMini from "@/components/SpinnerMini";

export default function InviteSection({
  classroom,
  session,
}: {
  classroom: IClass;
  session: ISession;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  async function handleJoinClass(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const classroomId = formData.get("classroomId") as string;
    const { success, message } = await joinClass(classroomId);
    if (success) {
      setIsSuccessful(true);
      setIsLoading(false);
      router.push(`/classroom/class/${classroomId}`);
    } else toast.error(message);
  }

  return (
    <section className="z-10 mx-8 grid w-full gap-4 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-4 md:mx-60 md:w-[25rem]">
      <div className="w-full">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold tracking-tight">
          {classroom.className}
        </h1>
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
          {classroom.subject && `${classroom.subject} · `}
          {classroom.section}
        </p>
      </div>
      <div className="flex gap-2 rounded-md border border-[#dddfe6] bg-[#f5f8ff] px-4 py-2">
        <Image
          src={session.image ?? ""}
          alt={`${session.name}'s avatar`}
          width={32}
          height={32}
          className="h-8 w-8 flex-shrink-0 rounded-full"
        />
        <div>
          <p className="text-sm font-medium">{session.name}</p>
          <p className="text-xs">{session.email}</p>
        </div>
      </div>
      <form onSubmit={handleJoinClass}>
        <input
          type="text"
          defaultValue={classroom.classroomId}
          name="classroomId"
          hidden
        />
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#22317c] px-3 py-2 text-sm font-medium text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-not-allowed disabled:bg-[#1b2763] disabled:text-[#d5dae6]"
          disabled={isLoading || isSuccessful}
          type="submit"
        >
          {isLoading && <SpinnerMini />}
          <span>
            {isSuccessful
              ? "You've successfully joined the class!"
              : "Join class"}
          </span>
        </button>
      </form>
    </section>
  );
}
