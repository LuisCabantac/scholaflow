import React from "react";

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
    <div className="flex">
      <Provider>
        {session && <Sidebar session={hasUser(session) ? session : null} />}
        <main className="h-full w-full overflow-auto px-5 py-5 md:px-8">
          {session && <Header />}
          {children}
        </main>
      </Provider>
    </div>
  );
}
