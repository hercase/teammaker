import { GoogleClientID, GoogleClientSecret } from "@/env";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: GoogleClientID,
      clientSecret: GoogleClientSecret,
    }),
  ],
});

export { handler as GET, handler as POST };
