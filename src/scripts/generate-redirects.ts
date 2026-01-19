import { createClient } from "@sanity/client";
import fs from "fs";
import { resolveCanonicalUrl } from "../lib/resolveCanonicalUrl";

const client = createClient({
  projectId: '366sb9yi',
    dataset: 'production',
    useCdn: true,
    apiVersion: '2025-01-28',
});

const works = await client.fetch(`
  *[_type == "work" && defined(aliases)]{
    "slug": slug.current,
    type,
    releaseDate,
    aliases
  }
`);

const redirects = [];

for (const work of works) {
  const destination = resolveCanonicalUrl(work);

  for (const source of work.aliases) {
    redirects.push({
      source,
      destination,
      permanent: true,
    });
  }
}

const vercelConfig = {
  redirects,
};

fs.writeFileSync(
  "vercel.json",
  JSON.stringify(vercelConfig, null, 2)
);