import { GoogleClientID, GoogleClientSecret } from "@/env";
import { createPerson } from "@/services/person";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GoogleClientID,
      clientSecret: GoogleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const gProfile = profile as GoogleProfile;

      if (!gProfile) return false;

      createPerson({
        name: gProfile.name,
        nickname: gProfile.given_name,
        email: gProfile.email,
        image: gProfile.picture,
      });

      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
