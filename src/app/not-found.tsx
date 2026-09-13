import Link from "next/link";
import { buttonVariants } from "@heroui/styles";

// A link that has to look like a button, so it borrows HeroUI's own recipe for one.
const NotFound = () => (
  <section className="flex w-full items-center justify-center py-16">
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      <h2 className="text-7xl font-semibold text-text">
        <span className="sr-only">Error</span>404
      </h2>
      <p className="text-lg text-text-muted">Lo sentimos, no pudimos encontrar esta página.</p>
      <Link
        href="/"
        className={buttonVariants({ variant: "primary", size: "md" })}
      >
        Volver al inicio
      </Link>
    </div>
  </section>
);

export default NotFound;
