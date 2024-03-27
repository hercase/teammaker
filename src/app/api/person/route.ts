import { NextResponse } from "next/server";
import { getClient } from "@/sanity/client";
import { snakeCase } from "lodash";
import { GET_PERSON_BY_EMAIL } from "@/sanity/queries";

const client = getClient();

// GET /api/person?email=...
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const person = await client.fetch(GET_PERSON_BY_EMAIL, { email });

  if (!person) return NextResponse.json({ error: "Person not found" }, { status: 404 });

  return NextResponse.json(person);
};

// POST /api/person

export const POST = async (request: Request) => {
  const body = await request.json();
  const person = await client.createIfNotExists({ _type: "person", _id: snakeCase(body.email), ...body });

  if (!person) return NextResponse.json({ error: "Person not created" }, { status: 500 });

  return NextResponse.json({ message: "Person created" });
};
