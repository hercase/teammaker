import { NextResponse } from "next/server";
import { getClient } from "@/sanity/client";
import { GET_MATCHES_BY_ORGANIZER } from "@/sanity/queries";

const client = getClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizerId = searchParams.get("organizerId");
  const matches = await client.fetch(GET_MATCHES_BY_ORGANIZER, { organizerId });

  return NextResponse.json(matches);
}
