import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import classNames from "classnames";
import SessionWrapper from "@/components/SessionWrapper";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Maker",
  description: "Vos tambien podes crear equipos rápidamente y compartilos de con tus amigos!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: Readonly<LayoutProps>) => {
  const session = await getServerSession();

  if (session == null) return redirect("api/auth/signin");

  return (
    <SessionWrapper>
      <html lang="en" className={classNames(inter.className)}>
        <body className="grid grid-rows-[4rem_1fr] h-screen text-white bg-primary-950 max-w-1200 mx-auto w-95vw">
          <Header />
          <main className="flex flex-col items-center h-full bg-gradient-to-b from-primary-800 dark:from-primary-900 to-primary-950 max-w-screen-lg mx-auto w-full rounded-t-md">
            {children}
          </main>
        </body>
      </html>
    </SessionWrapper>
  );
};

export default Layout;
