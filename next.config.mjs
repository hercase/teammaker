import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, webpack }) => {
    // The layout renders DevBar only under NODE_ENV === "development", but a static import of a
    // "use client" module survives dead-code elimination, so production swaps it for a stub.
    if (!dev) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@\/components\/DevBar$/,
          path.resolve("./src/components/DevBar/stub.tsx")
        )
      );
    }

    return config;
  },
};

export default nextConfig;
