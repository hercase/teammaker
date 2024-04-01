import Header from "@/components/Header";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: Readonly<LayoutProps>) => {
  const session = await getServerSession();

  if (session == null) return redirect("/auth/login");

  return (
    <body className="grid grid-rows-[4rem_1fr] h-screen text-white bg-primary-950 max-w-1200 mx-auto w-95vw">
      <Header />
      <main className="flex flex-col items-center h-full bg-gradient-to-b from-primary-800 dark:from-primary-900 to-primary-950 max-w-screen-lg mx-auto w-full rounded-t-md">
        {children}
      </main>
    </body>
  );
};

export default Layout;
