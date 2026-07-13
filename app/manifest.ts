import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ValoStats",
    short_name: "ValoStats",
    description: "Your Valorant performance, redefined.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/logo.png", sizes: "any", type: "image/png" },
    ],
  };
}
