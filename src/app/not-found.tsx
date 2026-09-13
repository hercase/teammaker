import Link from "next/link";
import { buttonClasses } from "@/components/Button";

// The way home is a link, so it borrows Button's recipe rather than a hand-rolled copy of it.
const NotFound = () => (
  <section className="flex w-full items-center justify-center py-16">
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      <h2 className="font-display text-7xl font-bold text-text">
        <span className="sr-only">Error</span>404
      </h2>
      <p className="text-lg text-text-muted">Lo sentimos, no pudimos encontrar esta página.</p>
      <Link
        href="/"
        className={buttonClasses()}
      >
        Volver al inicio
      </Link>
    </div>
  </section>
);

export default NotFound;
