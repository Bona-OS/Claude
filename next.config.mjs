/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Permite exibir as fotos servidas pelo Storage do Supabase na landing/painel.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
