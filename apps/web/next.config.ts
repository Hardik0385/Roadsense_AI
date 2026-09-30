/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: path.join(process.cwd(), '../../'),
  },
};

export default nextConfig;
