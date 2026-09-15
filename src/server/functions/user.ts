import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import {
  getUser,
  getAllUser,
  getUsersFilter,
  getUserByUserId,
  getAccountByUserId,
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

    return await getUserByUserId(userId);
  });

export const getAccountByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAccountByUserId(userId);
  });

export const getAllUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      return { success: false, message: "Error getting all users", data: [] };
    }

    const data = await getAllUser();
    if (!data.length) {
      return { success: false, message: "Error getting all users", data: [] };
    }

    return { success: true, message: "Fetch success", data };
  },
);

export const getUsersFilterFn = createServerFn({ method: "POST" })
  .validator((name: string) => name)
  .handler(async ({ data: name }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      return { success: false, message: "Error getting all users", data: [] };
    }

    const data = await getUsersFilter(name);
    if (!data.length) {
      return { success: false, message: "Error getting all users", data: [] };
    }

    return { success: true, message: "Fetch success", data };
  });
