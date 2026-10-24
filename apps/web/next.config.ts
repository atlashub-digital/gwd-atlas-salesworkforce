import type { NextConfig } from "next";
const config:NextConfig={transpilePackages:["@gwd/ui","@gwd/config","@gwd/domain"],poweredByHeader:false,reactStrictMode:true,
 /* AVIF first (≈30–40 % lighter than WebP for the hero cut-out, LCP on mobile), WebP fallback. */
 images:{formats:["image/avif","image/webp"]}};
export default config;
