/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // One worker keeps production builds predictable in constrained CI hosts.
    cpus: 1,
    workerThreads: true,
    webpackBuildWorker: false,
  },
};
export default nextConfig;
