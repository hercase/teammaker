import Link from "next/link";

const NotFound = () => (
  <section className="flex items-center h-screen p-16">
    <div className="container flex flex-col items-center ">
      <div className="flex flex-col gap-6 max-w-md text-center">
        <h2 className="font-extrabold text-8xl text-gray-100 ">
          <span className="sr-only">Error</span>404
        </h2>
        <p className="text-2xl text-gray-300">Lo sentimos, no pudimos encontrar esta página.</p>
        <Link
          href="/"
          passHref
          className="px-8 py-4 text-lg font-medium rounded bg-purple-600 text-gray-50 hover:text-gray-200 uppercase
          "
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  </section>
);

export default NotFound;
