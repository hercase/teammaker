export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-01-01";

function assertEnv(v: string | undefined): string {
  const env = process.env[v as string];

  if (!env) {
    throw new Error(`Missing environment variable: ${v}`);
  }

  return env;
}

export const dataset = assertEnv("NEXT_PUBLIC_SANITY_DATASET");
export const projectId = assertEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
export const GoogleClientID = assertEnv("GOOGLE_CLIENT_ID");
export const GoogleClientSecret = assertEnv("GOOGLE_CLIENT_SECRET");
export const NextAuthSecret = assertEnv("NEXTAUTH_SECRET");
export const NextAuthURL = assertEnv("NEXTAUTH_URL");
