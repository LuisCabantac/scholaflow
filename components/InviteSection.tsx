"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Session } from "@/lib/schema";
import { Classroom } from "@/lib/schema";
import { joinClass } from "@/lib/classroom-actions";

import { Button } from "@/components/ui/button";

export default function InviteSection({
  classroom,
  session,
}: {
  classroom: Classroom;
  session: Session;
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
    <div className="z-10 mx-auto grid w-full max-w-md gap-4 rounded-xl border bg-card p-4">
      <div className="w-full">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {classroom.name}
        </h1>
        <p className="text-sm text-foreground/90">
          {classroom.subject && `${classroom.subject} · `}
          {classroom.section}
        </p>
      </div>
      <div className="flex gap-2 rounded-xl border bg-card p-3 text-foreground/70">
        <Image
          src={session.image ?? ""}
          alt={`${session.name}'s avatar`}
          width={32}
          height={32}
          className="h-8 w-8 flex-shrink-0 select-none rounded-full"
          onDragStart={(e) => e.preventDefault()}
        />
        <div>
          <p className="font-medium">{session.name}</p>
          <p className="text-xs">{session.email}</p>
        </div>
      </div>
      <form className="grid gap-3" onSubmit={handleJoinClass}>
        <input
          type="text"
          defaultValue={classroom.id}
          name="classroomId"
          hidden
        />
        {isSuccessful && (
          <div className="flex gap-2 rounded-xl border bg-card p-3 text-muted-foreground">
            <CircleCheck className="h-6 w-6 flex-shrink-0 stroke-success" />
            <span>You&apos;ve successfully joined the class!</span>
          </div>
        )}
        <Button
          disabled={isLoading || isSuccessful}
          type="submit"
          className="w-full"
        >
          {isLoading ? "Joining class..." : "Join class"}
        </Button>
      </form>
    </div>
  );
}
