import React from "react";
import { Toaster } from "react-hot-toast";

import Provider from "@/app/Provider";
import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Provider>
        {session && <Sidebar session={hasUser(session) ? session : null} />}
        <main className="h-full w-full overflow-auto px-5 py-5 md:px-8">
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
