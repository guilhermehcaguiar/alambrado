import type { NextConfig } from "next";

function getSupabaseHostname(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      // URL inválida cai no fallback abaixo
    }
  }
  return "*.supabase.co";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getSupabaseHostname(),
        pathname: "/storage/v1/object/public/products/**",
      },
    ],
  },
};

export default nextConfig;
