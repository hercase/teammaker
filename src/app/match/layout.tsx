import type { Metadata } from "next";

/*
  The page is a client component and cannot export metadata, so its layout does. noindex as well as
  the robots.txt rule: a disallow alone stops the crawl, not the listing, and a link to /match from
  anywhere could still put the empty screen in results.
*/
export const metadata: Metadata = { robots: { index: false, follow: true } };

const MatchLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => children;

export default MatchLayout;
