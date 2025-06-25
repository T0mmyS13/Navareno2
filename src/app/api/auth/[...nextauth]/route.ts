import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getPool } from "@/utils/db";
import bcrypt from "bcryptjs";

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
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.username = user.username;
        token.profilePic = user.profilePic;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.name = token.username;
        session.user.image = token.profilePic;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
