import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Speech Coach",
    short_name: "Speech Coach",
    description: "Table Topics und vorbereitete Reden üben, mit KI-Feedback",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
