import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityAPIToken } from "@/env";

export function getClient(token?: string): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: sanityAPIToken,
    useCdn: false,
  });

  return client;
}
