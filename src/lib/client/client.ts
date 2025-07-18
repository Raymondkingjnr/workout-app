import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "idhmztm4",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.EXPO_PUBLIC_SANITY_STUDIO_TOKEN || "",
});
// export const client = createClient(config);

// export const adminclient = createClient(adminconfig);

const builder = imageUrlBuilder(client);
export const urlfor = (source: string) => builder.image(source);
