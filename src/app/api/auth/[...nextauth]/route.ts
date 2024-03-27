import { GoogleClientID, GoogleClientSecret } from "@/env";
import { createPerson, userExist } from "@/queries/person";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";

/* signIn {
  user: {
    id: '102741637911349241048',
    name: 'Hernan Case',
    email: 'hercase92@gmail.com',
    image: 'https://lh3.googleusercontent.com/a/ACg8ocI_BBObUVgG9OCaD-47vGefk9GTn2IJzyNvrROhYes46ntJ=s96-c'
  },
  account: {
    provider: 'google',
    type: 'oauth',
    providerAccountId: '102741637911349241048',
    access_token: 'ya29.a0Ad52N3-fCnJi8MWyLf2DUe4dVMXWnARikHo5tXzWNFurFInj_fAE_QaZ6_ufSjg4vjSN6Jrc3KV3pGaE8rxIFEaji6Xj68h-psWGC3GNRVuQi7PmievOQzMerBPoCYnw3iLS1DBSHFfQEs-qtvj8km_oRKD9G9XyA98aCgYKARISARASFQHGX2Mi81vBRnLuTgIrdI-IDn_MSQ0170',
    expires_at: 1711461361,
    scope: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    token_type: 'Bearer',
    id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkZjVlNzEwZWRmZWJlY2JlZmE5YTYxNDk1NjU0ZDAzYzBiOGVkZjgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyMjM0Njg2NzQ2OTItb2ZwdjU4c2p1NDg0M2xqZXFqZjFzZHZjNmRjOGpiY2MuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyMjM0Njg2NzQ2OTItb2ZwdjU4c2p1NDg0M2xqZXFqZjFzZHZjNmRjOGpiY2MuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDI3NDE2Mzc5MTEzNDkyNDEwNDgiLCJlbWFpbCI6ImhlcmNhc2U5MkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjJ0ckhtRVRPYTlITk1ocjJjOEdnTHciLCJuYW1lIjoiSGVybmFuIENhc2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSV9CQk9iVVZnRzlPQ2FELTQ3dkdlZms5R1RuMklKenlOdnJST2hZZXM0Nm50Sj1zOTYtYyIsImdpdmVuX25hbWUiOiJIZXJuYW4iLCJmYW1pbHlfbmFtZSI6IkNhc2UiLCJpYXQiOjE3MTE0NTc3NjIsImV4cCI6MTcxMTQ2MTM2Mn0.BKs3UdHcVZOoUSUwhWxPnEFb4JAiCpj_380PDBw6hzu25lO8EEvgxhqGyxwS384vb7uZdat8Gq4WHgVKr9YmDLNmkzkC7zNowOsw6CG2unf75X0o36Ldm1t03NRPDdmJXma0Q2Ms5fOCmE3WPbg5x1Tl8V4O43nhS_bg_JbTVKQQfeRM7SF-5GVMRC9LT6DPItelS1_2NhuXycgaXyNmu4CsDPGYnd_T7C79m0r3vincQskaj5G3-qgkT6TKvZ_52yjH_kMnXYm_nVYrltCUVL6ObwFYfTIpIgjCjQ7h2-YYo4FkOQebvsQAaO2NCv6SWDMa8klU-DmW7y940Q_odw'
  },
  profile: {
    iss: 'https://accounts.google.com',
    azp: '223468674692-ofpv58sju4843ljeqjf1sdvc6dc8jbcc.apps.googleusercontent.com',
    aud: '223468674692-ofpv58sju4843ljeqjf1sdvc6dc8jbcc.apps.googleusercontent.com',
    sub: '102741637911349241048',
    email: 'hercase92@gmail.com',
    email_verified: true,
    at_hash: '2trHmETOa9HNMhr2c8GgLw',
    name: 'Hernan Case',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocI_BBObUVgG9OCaD-47vGefk9GTn2IJzyNvrROhYes46ntJ=s96-c',
    given_name: 'Hernan',
    family_name: 'Case',
    iat: 1711457762,
    exp: 1711461362
  }
} */

export const authOptions: AuthOptions = {
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
