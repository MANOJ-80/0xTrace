import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminEmail } from "./admins";
import { recordUserSignIn, shouldTouchLastSeen, touchUser } from "./users";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && user.email.endsWith("@psgitech.ac.in")) {
        await recordUserSignIn(user);
        return true;
      }
      return "/unauthorized";
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = isAdminEmail(user.email);
        token.lastSeenAt = Date.now();
      } else if (token.email && shouldTouchLastSeen(token.lastSeenAt)) {
        token.lastSeenAt = Date.now();
        await touchUser(token.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
