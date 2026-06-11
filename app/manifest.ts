// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Workout Cool",
    short_name: "WorkoutCool",
    description: "Modern open-source fitness coaching platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00D4AA",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}