/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable server-side features since we're running in Electron
  // experimental: {
  //   appDir: false,
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sqlite3: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
