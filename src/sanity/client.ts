import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/env";

export function getClient(token?: string): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  });

  if (!token) {
    return client;
  }

  return client.withConfig({
    token,
    useCdn: false,
    ignoreBrowserTokenWarning: true,
  });
}
