import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import classNames from "classnames";
import SessionWrapper from "@/components/SessionWrapper";

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

const Layout = async ({ children }: Readonly<LayoutProps>) => (
  <SessionWrapper>
    <html lang="en" className={classNames(inter.className)}>
      {children}
    </html>
  </SessionWrapper>
);

export default Layout;
