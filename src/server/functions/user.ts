import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import type { User } from "@/lib/schema";
import {
  getAllUser,
  getUser,
  getUserByUserId,
} from "@/services/user";

export const getUserFn = createServerFn({ method: "GET" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getUser(email);
  });

export const getUserByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;
    if (session.user.id !== userId && session.user.role !== "admin") {
      return null;
    }

    return await getUserByUserId(userId);
  });

export const getAllUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<User[]> => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin") return [];

    return await getAllUser();
  },
);
