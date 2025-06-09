import React from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Provider from "@/app/Provider";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
} from "@/lib/classroom-service";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getAllUnreadNotificationByUserId } from "@/lib/notification-service";

export const metadata: Metadata = {
  title: { template: "%s | ScholaFlow", default: "ScholaFlow" },
  description:
    "All your classroom tools in one place. Get organized, stay focused, and make learning click.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  async function handleGetAllClassesByTeacherId(id: string) {
    "use server";
    if (!id) return null;
    if (session && session.user.role === "teacher") {
      const data = await getAllClassesByTeacherId(id);
      return data;
    } else return null;
  }

  async function handleGetAllEnrolledClassesByUserId(id: string) {
    "use server";
    if (!id) return null;
    if (
      session &&
      (session.user.role === "teacher" || session.user.role === "student")
    ) {
      const data = await getAllEnrolledClassesByUserId(id);
      return data;
    } else return null;
  }

  async function handleGetAllUnreadNotificationByUserId(id: string) {
    "use server";
    if (!id) return null;
    const data = await getAllUnreadNotificationByUserId(id);
    return data;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Provider>
        {session && (
          <Sidebar
            session={session ? session.user : null}
            onGetAllClassesByTeacherId={handleGetAllClassesByTeacherId}
            onGetAllEnrolledClassesByUserId={
              handleGetAllEnrolledClassesByUserId
            }
            onGetAllUnreadNotificationByUserId={
              handleGetAllUnreadNotificationByUserId
            }
          />
        )}
        <main className="h-full w-full overflow-auto">
          {session && <Header />}
          <div className="px-4 pb-4 md:px-8">{children}</div>
        </main>
      </Provider>
    </div>
  );
}
