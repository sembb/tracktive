import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['192.168.178.48', 'image.tmdb.org', '192.168.99.157', 's4.anilist.co', 'cdn-images.dzcdn.net'], // jouw backend domein of IP hier
  },
};

export default nextConfig;
