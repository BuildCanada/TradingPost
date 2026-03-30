import { Person } from "schema-dts";

export interface AuthorData {
  name: string;
  url?: string;
  image?: string;
}

export function createAuthor(data: AuthorData): Person {
  return {
    "@type": "Person",
    name: data.name,
    ...(data.url && { url: data.url }),
    ...(data.image && {
      image: {
        "@type": "ImageObject",
        url: data.image.startsWith("http")
          ? data.image
          : `https://buildcanada.ca${data.image}`,
      },
    }),
  };
}
