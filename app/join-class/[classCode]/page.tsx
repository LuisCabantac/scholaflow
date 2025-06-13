import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import {
  getClassByClassCode,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

import Logo from "@/components/Logo";
import InviteSection from "@/components/InviteSection";
import { Card, CardHeader } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classCode: string }>;
}): Promise<Metadata> {
  const { classCode } = await params;

  const classroom = await getClassByClassCode(classCode);

  return {
    title: `Join - ${classroom?.name}`,
    description: classroom?.description || `${classroom?.name} class.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ classCode: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const { classCode } = await params;

  const classroom = await getClassByClassCode(classCode);

  if (!classroom) return redirect("/classroom");

  const enrolledUser = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    classroom.id,
  );

  if (enrolledUser || session.user.id === classroom.teacherId)
    return redirect("/classroom");

  return (
    <section className="relative flex min-h-[90dvh] items-center justify-center px-8 py-[8rem] md:grid md:h-full md:px-20 md:py-0">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          <Link href="/">
            <Logo size={10} />
          </Link>
          <Card className="mx-auto flex flex-col gap-4 border-0 bg-transparent shadow-none md:w-[24rem]">
            <CardHeader className="w-full text-center text-2xl font-medium tracking-tighter">
              Join Class
            </CardHeader>
            <InviteSection classroom={classroom} session={session.user} />
          </Card>
        </div>
      </div>
    </section>
  );
}
