import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const config = {
  projectId: "idhmztm4",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
};
export const client = createClient(config);
const adminconfig = {
  ...config,
  tokon: process.env.SANITY_API_TOKEN,
};

export const adminclient = createClient(adminconfig);

const builder = imageUrlBuilder(config);
export const urlfor = (source: string) => builder.image(source);
