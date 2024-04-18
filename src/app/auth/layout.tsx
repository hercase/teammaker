import { LayoutProps } from "@/app/layout";

const Layout = async ({ children }: Readonly<LayoutProps>) => <body>{children}</body>;

export default Layout;
