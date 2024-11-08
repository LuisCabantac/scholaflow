import NextAuth, { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { createUser } from "@/lib/auth-actions";
import { getUser, getUserByEmail } from "@/lib/data-service";
import { generatePassword } from "@/lib/utils";

export interface ISession {
  user: {
    id: string;
    name: string;
    email: string;
    schoolName: string | null;
    image: string;
    verified: boolean;
    role: "student" | "teacher" | "admin";
  };
  expires: string;
}

interface IUser extends User {
  id: string;
  name: string;
  email: string;
  image: string;
  role?: "student" | "teacher" | "admin";
}

const authConfig = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials: Partial<Record<string, unknown>>) {
        if (!credentials.email) return null;
        const email = credentials.email as string;
        const user = await getUserByEmail(email);
        if (user && user.password === credentials.password) {
          return user;
        } else {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User | AdapterUser }) {
      try {
        const existingUser = await getUserByEmail((user as IUser).email);
        if (!existingUser) {
          await createUser({
            email: user.email,
            fullName: user.name,
            avatar: user.image,
            role: "student",
            emailVerified: true,
            password: generatePassword(8),
          });
        }
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) token.role = (user as IUser).role;
      return token;
    },
    async session({ session }: { session: Session }) {
      const user = await getUser((session as ISession).user.email);

      (session as ISession).user.id = user.id;
      (session as ISession).user.name = user.fullName;
      (session as ISession).user.image = user.avatar;
      (session as ISession).user.role = user.role;
      (session as ISession).user.schoolName = user.schoolName;
      (session as ISession).user.verified = user.verified;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
