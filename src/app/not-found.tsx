import Link from "next/link";

const NotFound = () => (
  <section className="flex items-center min-h-dvh p-16">
    <div className="container flex flex-col items-center ">
      <div className="flex flex-col gap-6 max-w-md text-center">
        <h2 className="font-extrabold text-8xl text-text">
          <span className="sr-only">Error</span>404
        </h2>
        <p className="text-2xl text-text-muted">Lo sentimos, no pudimos encontrar esta página.</p>
        <Link
          href="/"
          passHref
          className="px-8 py-4 text-lg font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-500 uppercase transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  </section>
);

export default NotFound;
