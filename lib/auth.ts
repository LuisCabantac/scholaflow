import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { createUser } from "./auth-actions";
import { getSchool, getUser } from "./data-service";

export interface ISession {
  user: {
    id: string;
    name: string;
    email: string;
    school: string;
    schoolName: string | null;
    image: string;
    verified: boolean;
    role: "student" | "teacher" | "admin";
  };
  expires: string;
}

export interface ISchool {
  schoolId: string;
  created_at: string;
  schoolName: string;
  location: string;
  schoolLogo: string;
}

interface ICredentials {
  email: string;
  password?: string;
}

const authConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials: ICredentials) {
        if (credentials === null) return null;
        const user = await getUser(credentials?.email);
        if (user) {
          const isMatch = user.password === credentials.password;

          if (isMatch) {
            return user;
          } else {
            return null;
          }
        } else return null;
      },
    }),
    Google({
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
    authorized({ auth }: { auth: ISession | null }) {
      return !!auth?.user;
    },
    async signIn({ user, account }) {
      try {
        const existingUser = await getUser(user.email);

        if (!existingUser)
          await createUser({
            email: user.email,
            fullName: user.name,
            avatar: user.image,
            role: "student",
            emailVerified: true,
          });

        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user, session }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session }: { session: ISession }) {
      const user = await getUser(session.user.email);
      const school = await getSchool(user.school);

      const schoolName =
        Array.isArray(school) && school.length > 0
          ? (school as ISchool[])[0].schoolName
          : null;

      session.user.id = user.id;
      session.user.name = user.fullName;
      session.user.image = user.avatar;
      session.user.role = user.role;
      session.user.school = user.school;
      session.user.schoolName = schoolName;
      session.user.verified = user.verified;

      return session;
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
