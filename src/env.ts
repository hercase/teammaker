export const apiVersion = process.env.SANITY_API_VERSION || "2023-01-01";

function assertEnv(v: string | undefined): string {
  const env = process.env[v as string];

  if (!env) {
    console.error(`Missing environment variable: ${v}`);
    return "";
  }

  return env;
}

export const dataset = assertEnv("SANITY_DATASET");
export const projectId = assertEnv("SANITY_PROJECT_ID");
export const sanityAPIToken = assertEnv("SANITY_API_TOKEN");
export const GoogleClientID = assertEnv("GOOGLE_CLIENT_ID");
export const GoogleClientSecret = assertEnv("GOOGLE_CLIENT_SECRET");
export const NextAuthSecret = assertEnv("NEXTAUTH_SECRET");
export const baseUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? `https://teammaker.vercel.app/` : "http://localhost:3000";
