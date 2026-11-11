import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { inferAdditionalFields } from "better-auth/client/plugins";

import { db } from "@/db";
import { schema } from "@/db/schema";
import { defaultAvatarUrl } from "@/lib/default-avatar";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, image: user.image ?? defaultAvatarUrl() },
        }),
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
      },
      schoolName: {
        type: "string",
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
          defaultValue: "user",
        },
        schoolName: {
          type: "string",
          required: false,
          defaultValue: null,
        },
      },
    }),
    tanstackStartCookies(),
    jwt(),
  ],
});
