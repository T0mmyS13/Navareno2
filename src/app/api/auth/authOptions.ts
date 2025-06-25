import CredentialsProvider from "next-auth/providers/credentials";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getPool } from "@/utils/db";
import bcrypt from "bcryptjs";

export type ExtendedUser = User & { username: string; profilePic: string };
export type ExtendedJWT = JWT & { username?: string; profilePic?: string };

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const pool = getPool();
        try {
          const result = await pool.query(
            "SELECT id, email, password, username, profile_pic FROM users WHERE email = $1",
            [credentials.email]
          );
          if (result.rows.length === 0) return null;
          const user = result.rows[0];
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            profilePic: user.profile_pic
          };
        } catch {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        const extUser = user as ExtendedUser;
        (token as ExtendedJWT).username = extUser.username;
        (token as ExtendedJWT).profilePic = extUser.profilePic;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.name = (token as ExtendedJWT).username ?? undefined;
        session.user.image = (token as ExtendedJWT).profilePic ?? undefined;
      }
      return session;
    }
  }
};

