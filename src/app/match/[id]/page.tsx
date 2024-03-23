import { getMatch } from "@/sanity/queries";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Match({ params }: PageProps) {
  const match = await getMatch(params.id);

  if (!match) {
    return <div>Match not found</div>;
  }

  return <div>My Post: {JSON.stringify(match)}</div>;
}
