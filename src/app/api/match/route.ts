import { NextResponse } from "next/server";
import { getClient } from "@/sanity/client";
import { GET_MATCH_BY_ID } from "@/sanity/queries";

const client = getClient();

// GET /api/match?id=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const match = await client.fetch(GET_MATCH_BY_ID, { id });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  return NextResponse.json(match);
}

// POST /api/match
export async function POST(request: Request) {
  const body = await request.json();
  const match = await client.create({ _type: "match", ...body });

  if (!match) return NextResponse.json({ error: "Match not created" }, { status: 500 });

  return NextResponse.json({ message: "Match created", _id: match._id });
}
