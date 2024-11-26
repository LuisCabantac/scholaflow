import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import Provider from "@/app/Provider";
import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
} from "@/lib/data-service";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: { template: "%s | ScholaFlow", default: "ScholaFlow" },
  description: "Your All-in-One Learning Platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  async function handleGetAllClassesByTeacherId(id: string) {
    "use server";
    if (hasUser(session) && session.user.role === "teacher") {
      const data = await getAllClassesByTeacherId(id);
      return data;
    } else return null;
  }

  async function handleGetAllEnrolledClassesByUserId(id: string) {
    "use server";
    if (
      hasUser(session) &&
      (session.user.role === "teacher" || session.user.role === "student")
    ) {
      const data = await getAllEnrolledClassesByUserId(id);
      return data;
    } else return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Provider>
        {session && (
          <Sidebar
            session={hasUser(session) ? session : null}
            onGetAllClassesByTeacherId={handleGetAllClassesByTeacherId}
            onGetAllEnrolledClassesByUserId={
              handleGetAllEnrolledClassesByUserId
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
