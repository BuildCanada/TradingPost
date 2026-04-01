import { stripNulls, buildSameAs } from "../utils";

interface PersonData {
  name: string;
  title?: string | null;
  photo?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  xUrl?: string | null;
  linkedinUrl?: string | null;
}

export function generatePersonSchema(person: PersonData) {
  const sameAs = buildSameAs(person);
  return stripNulls({
    "@type": "Person" as const,
    name: person.name,
    jobTitle: person.title,
    image: person.photo,
    description: person.bio,
    url: person.websiteUrl,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });
}

export type { PersonData };
