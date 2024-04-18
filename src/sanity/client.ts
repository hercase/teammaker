import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityAPIToken } from "@/env";

export function getClient(): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: sanityAPIToken,
    useCdn: process.env.NODE_ENV === "production",
  });

  return client;
}
