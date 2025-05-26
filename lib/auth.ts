import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/index";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.body) {
        console.log(ctx.body);
      }
    }),
  },
});
