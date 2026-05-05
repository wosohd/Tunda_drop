import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  console.warn("Missing EXPO_PUBLIC_SANITY_PROJECT_ID in .env");
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source) {
  if (!source) return null;
  return builder.image(source);
}