import React from "react";
import { Toaster } from "react-hot-toast";
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
        <main className="h-full w-full overflow-auto px-4 py-4 md:px-8 md:py-5">
          {session && <Header />}
          {children}
        </main>
      </Provider>
      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            color: "#5c7cfa",
            backgroundColor: "#f3f6ff",
            fontWeight: 500,
            padding: "0.75rem 1.25rem",
          },
        }}
      />
    </div>
  );
}
