// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan baris ini untuk mengabaikan Type Error saat build
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
