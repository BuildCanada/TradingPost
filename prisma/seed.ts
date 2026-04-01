import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(process.cwd(), filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(
    /(\w{3}) (\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2}):(\d{2})/
  );
  if (match) return new Date(dateStr);
  return null;
}

function mapRole(csvRole: string): string {
  if (!csvRole) return "ADVISOR";
  const lower = csvRole.trim().toLowerCase();
  if (lower === "team") return "CORE";
  if (lower === "board") return "BOARD";
  return "ADVISOR";
}

async function ensureBuildCanadaPerson(): Promise<string> {
  const existing = await prisma.person.findFirst({ where: { name: "Build Canada" } });
  if (existing) return existing.id;
  const person = await prisma.person.create({
    data: {
      name: "Build Canada",
      title: "Organization",
      role: "CORE",
      photo: null,
      xUrl: null,
      linkedinUrl: null,
      websiteUrl: null,
      bio: null,
      order: -1,
    },
  });
  return person.id;
}

async function seedPeople(authorLookup: Map<string, string>) {
  const rows = readCsv("authors.csv");

  for (const row of rows) {
    const name = row["Name"]?.trim();
    const slug = row["Slug"]?.trim();
    if (!name) continue;

    const csvRole = row["Role"]?.trim();
    const isTeamMember = csvRole && ["Team", "Board", "Volunteer"].includes(csvRole);

    const person = await prisma.person.create({
      data: {
        name,
        title: row["Title"]?.trim() || null,
        role: isTeamMember ? mapRole(csvRole) : "AUTHOR",
        photo: row["Profile Photo"]?.trim() || null,
        xUrl: row["Twitter"]?.trim() || null,
        linkedinUrl: row["LinkedIn"]?.trim() || null,
        websiteUrl: null,
        bio: null,
        order: isTeamMember
          ? parseInt(row["Team Order"] || "0") || 0
          : 0,
      },
    });

    if (slug) {
      authorLookup.set(slug, person.id);
    }
  }

  const teamCount = rows.filter(
    (r: Record<string, string>) =>
      r["Role"] &&
      ["Team", "Board", "Volunteer"].includes(r["Role"].trim())
  ).length;
  console.log(`  Created ${rows.length} people (${teamCount} team members)`);
}

async function seedMemos(
  authorLookup: Map<string, string>,
  buildCanadaId: string
) {
  const rows = readCsv("Memoscsv.csv");

  const featuredSlugs = ["canada-superpower", "g7s-best-economy", "go"];
  let count = 0;

  for (const row of rows) {
    const title = row["Memo Title"]?.trim();
    const slug = row["Slug"]?.trim();
    if (!title || !slug) continue;
    if (slug.startsWith("test")) continue;

    const builderSlug = row["Builder"]?.trim();
    const authorId = builderSlug
      ? authorLookup.get(builderSlug) || buildCanadaId
      : buildCanadaId;

    const body = row["Body"]?.trim() || "";
    const category = row["Category"]?.trim() || null;
    const seoImage = row["SEO Image"]?.trim() || null;
    const twitterEmbed = row["Twitter Embed"]?.trim() || null;
    const publishedOn = row["Published On"]?.trim();
    const publishedAt = publishedOn ? parseDate(publishedOn) : null;

    const keyMessage1 = row["Key Message 1"]?.trim() || title;
    const keyMessage2 = row["Key Message 2"]?.trim() || null;
    const keyMessage3 =
      row["Key Message 3"]?.trim() ||
      row["Key Message 4"]?.trim() ||
      null;

    await prisma.memo.create({
      data: {
        title,
        slug,
        authorId,
        keyMessage1,
        keyMessage2,
        keyMessage3,
        body,
        category,
        seoImage,
        twitterEmbed,
        publishedAt,
        featured: featuredSlugs.includes(slug),
      },
    });
    count++;
  }

  console.log(`  Created ${count} memos`);
}

async function seedProjects() {
  const projects = [
    {
      slug: "outcomes-tracker",
      title: "Outcomes Tracker",
      description:
        "Track government commitments and hold leaders accountable for delivery.",
      externalUrl: "https://buildcanada.ca/projects/outcomes-tracker",
      size: "big",
      featured: true,
      order: 0,
      accentColor: "#1a1a1a",
    },
    {
      slug: "builder-mp",
      title: "Builder MP",
      description:
        "See how your MP votes on issues that matter to Canadian builders.",
      externalUrl: "https://buildcanada.ca/projects/builder-mp",
      size: "small",
      featured: false,
      order: 1,
      accentColor: "#2563eb",
    },
    {
      slug: "tax-dollars",
      title: "Where Your Tax Dollars Go",
      description:
        "Understand how your income tax is spent across government programs.",
      externalUrl: "https://buildcanada.ca/projects/tax-dollars",
      size: "small",
      featured: false,
      order: 2,
      accentColor: "#059669",
    },
    {
      slug: "great-builders",
      title: "Great Canadian Builders",
      description:
        "Stories of the people who built Canada into the nation it is today.",
      externalUrl: "https://buildcanada.ca/projects/great-builders",
      size: "big",
      featured: false,
      order: 3,
      accentColor: "#932f2f",
    },
    {
      slug: "canada-spends",
      title: "Canada Spends",
      description:
        "A visual breakdown of federal government revenue and spending.",
      externalUrl: "https://buildcanada.ca/projects/canada-spends",
      size: "small",
      featured: true,
      order: 4,
      accentColor: "#7c3aed",
    },
    {
      slug: "trade-barriers",
      title: "Trade Barriers Tracker",
      description:
        "Mapping interprovincial trade barriers that cost Canadians billions.",
      externalUrl: "https://buildcanada.ca/projects/trade-barriers",
      size: "small",
      featured: false,
      order: 5,
      accentColor: "#d97706",
    },
    {
      slug: "exit-tax-calculator",
      title: "Exit Tax Calculator",
      description:
        "Compare capital gains tax between Canada and the United States.",
      externalUrl: "https://buildcanada.ca/projects/exit-tax-calculator",
      size: "small",
      featured: false,
      order: 6,
      accentColor: "#dc2626",
    },
  ];

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }

  console.log(`  Created ${projects.length} projects`);
}

async function seedFeedItems() {
  const items = [
    {
      type: "BLOG",
      title: "Canadians are Ready to Build",
      subtitle: "New survey shows Canadians want bold economic action",
      author: "Build Canada",
      image: null,
      body: "A new survey shows Canadians are ready to build. 70% want to prioritize long-term economic growth over short-term spending.",
      url: "https://buildcanada.ca/memos/ready-to-build",
      featured: true,
    },
    {
      type: "BLOG",
      title: "Canada Can Be a Superpower",
      subtitle: "Seven reforms to transform Canada into a top-5 global power",
      author: "Build Canada",
      image: null,
      body: "Canada has every raw ingredient to be a top-5 global power — massive land, critical mineral wealth, abundant energy, an educated population, and geographic security.",
      url: "https://buildcanada.ca/memos/canada-superpower",
    },
    {
      type: "BLOG",
      title: "Go!",
      subtitle: "Canada is in a productivity and execution crisis",
      author: "Build Canada",
      image: null,
      body: "Canada is in a productivity and execution crisis while the world is moving faster and becoming less forgiving.",
      url: "https://buildcanada.ca/memos/go",
    },
    {
      type: "X",
      author: "Build Canada",
      body: "Canada has the 3rd largest oil reserves on earth, the largest uranium deposits, and massive critical mineral wealth. It's time we started acting like a superpower.",
      url: "https://x.com/buildcanada/status/1234567890",
      authorPhoto: "/assets/logos/Logocircle.webp",
    },
    {
      type: "X",
      author: "Build Canada",
      body: "70% of Canadians want to prioritize long-term economic growth over short-term spending. The mandate is clear. Let's build.",
      url: "https://x.com/buildcanada/status/1234567891",
      authorPhoto: "/assets/logos/Logocircle.webp",
    },
    {
      type: "X",
      author: "Zander Fraser",
      body: "Internal trade barriers alone cost Canada 7% of GDP. We are the only developed country where it's easier to trade with foreign nations than between our own provinces.",
      url: "https://x.com/zandertoo/status/1234567892",
      authorPhoto: null,
    },
    {
      type: "X",
      author: "Build Canada",
      body: "Canada's corporate tax rate is uncompetitive. We've lost $43.7 billion in capital outflow. It's time for bold structural reform.",
      url: "https://x.com/buildcanada/status/1234567893",
      authorPhoto: "/assets/logos/Logocircle.webp",
    },
    {
      type: "IG",
      author: "Build Canada",
      body: "Canada needs to build 3.5 million homes by 2030. Free zoning is the first step. #BuildCanada #Housing",
      url: "https://instagram.com/p/example1",
      image: null,
    },
    {
      type: "IG",
      author: "Build Canada",
      body: "The space economy is expected to reach $2.5 trillion by 2035. Canada was the 3rd country in space — time to reclaim our position.",
      url: "https://instagram.com/p/example2",
      image: null,
    },
    {
      type: "IG",
      author: "Build Canada",
      body: "A fifth of Canadians are functionally illiterate. This costs Canada $67 billion in productivity. Let's build Canada's literacy foundation.",
      url: "https://instagram.com/p/example3",
      image: null,
    },
    {
      type: "TIKTOK",
      author: "Build Canada",
      body: "Why does it take 16 years to buy military equipment in Canada? Here's what needs to change. #BuildCanada #Defence",
      url: "https://tiktok.com/@buildcanada/video/1",
      image: null,
    },
    {
      type: "TIKTOK",
      author: "Build Canada",
      body: "Canadians pay 2.4x more for mobile than the UK. The Big Three control 90% of the market. Time for real competition.",
      url: "https://tiktok.com/@buildcanada/video/2",
      image: null,
    },
    {
      type: "SUBSTACK",
      title: "Canada Can Attract the World's Best Entrepreneurs",
      author: "Boris Wertz",
      body: "A loophole in Canada's Start-Up Visa program created a path for fraud and abuse. With U.S. immigration in chaos, Canada can't afford to wait.",
      url: "https://buildcanada.substack.com/p/example1",
      image: null,
    },
    {
      type: "SUBSTACK",
      title: "Five AI Moonshots for Canada",
      author: "Ajay Agrawal",
      body: "AI is a tool, not a goal. It only matters when applied to real problems with measurable outcomes. Here are five 10x targets that would transform Canada.",
      url: "https://buildcanada.substack.com/p/example2",
      image: null,
    },
    {
      type: "YOUTUBE",
      title: "Build Canada: The Movement",
      author: "Build Canada",
      body: "Canadians are ready to build. This is the story of a movement to make Canada the most competitive economy in the G7.",
      url: "https://youtube.com/watch?v=example",
      image: null,
    },
  ];

  for (const item of items) {
    await prisma.feedItem.create({
      data: {
        type: item.type,
        title: "title" in item ? item.title : null,
        subtitle: "subtitle" in item ? item.subtitle : null,
        author: item.author || null,
        authorPhoto: "authorPhoto" in item ? item.authorPhoto : null,
        image: "image" in item ? item.image : null,
        body: item.body || null,
        url: "url" in item ? item.url : null,
        featured: "featured" in item ? item.featured : false,
      },
    });
  }

  console.log(`  Created ${items.length} feed items`);
}

async function seedTestimonials() {
  const testimonials = [
    {
      name: "Harley Finkelstein",
      quote:
        "Build Canada is giving builders a platform to present their ideas for a richer, stronger, and freer country. This is exactly what Canada needs right now.",
      title: null,
      companyLogo: null,
      personId: null,
      order: 0,
    },
    {
      name: "Jeff Adamson",
      quote:
        "Canada has every advantage — talent, resources, geography. What we need is the political will to remove barriers and let builders build.",
      title: null,
      companyLogo: null,
      personId: null,
      order: 1,
    },
    {
      name: "Tobi Lutke",
      quote:
        "The best time to invest in Canada's future was decades ago. The second best time is right now. Let's make Canada the best place in the world to build.",
      title: null,
      companyLogo: null,
      personId: null,
      order: 2,
    },
    {
      name: "Daniel Eberhard",
      quote:
        "We have a historic opportunity to reform and rebuild. Canadians are demanding action, and the ideas are here. We just need the courage to execute.",
      title: null,
      companyLogo: null,
      personId: null,
      order: 3,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log(`  Created ${testimonials.length} testimonials`);
}

async function seedSiteConfig() {
  await prisma.siteConfig.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      orgName: "Build Canada",
      orgDescription:
        "Building the future of Canada through technology and entrepreneurship.",
      logoUrl: "https://buildcanada.ca/assets/logos/Logocircle.webp",
      siteUrl: "https://buildcanada.ca",
      socialLinks: JSON.stringify([
        "https://x.com/buildcanada",
        "https://linkedin.com/company/buildcanada",
        "https://instagram.com/buildcanada",
        "https://tiktok.com/@buildcanada",
        "https://buildcanada.substack.com",
        "https://youtube.com/@buildcanada",
      ]),
    },
  });

  console.log("  Created SiteConfig");
}

async function seedQandAItems() {
  const qandaItems = [
    {
      question: "Is Build Canada affiliated with a political party?",
      answer:
        "No. Build Canada is non-partisan. Our work is driven by one question: how do we make Canada the most prosperous country in the world?",
      order: 0,
      active: true,
    },
    {
      question: "How is Build Canada funded?",
      answer:
        "We're a federally incorporated non-profit organization funded by over 60 individual donors who believe in building a stronger country. We don't accept government grants or public funding, which keeps us independent.",
      order: 1,
      active: true,
    },
    {
      question: "Is Build Canada a lobby group?",
      answer:
        "No. We produce research, build community among Canadian founders and operators, and share policy ideas in public.",
      order: 2,
      active: true,
    },
    {
      question: "Do you support a specific policy platform?",
      answer:
        "We champion ideas that make Canada a better place to build and grow our economy — whether that means tax reform, talent retention, infrastructure investment, or regulatory modernization. If you want to learn more about where we stand and our latest ideas, follow along with our content — we're always publishing new ideas and perspectives from builders across the country.",
      order: 3,
      active: true,
    },
  ];

  for (const item of qandaItems) {
    await prisma.qandAItem.create({ data: item });
  }

  console.log(`  Created ${qandaItems.length} Q&A items`);
}

async function main() {
  console.log("Seeding database...\n");

  const authorLookup = new Map<string, string>();

  console.log("1. People");
  await seedPeople(authorLookup);

  const buildCanadaId = await ensureBuildCanadaPerson();

  console.log("\n2. Memos");
  await seedMemos(authorLookup, buildCanadaId);

  console.log("\n3. Projects");
  await seedProjects();

  console.log("\n4. Feed Items");
  await seedFeedItems();

  console.log("\n5. Testimonials");
  await seedTestimonials();

  console.log("\n6. Site Config");
  await seedSiteConfig();

  console.log("\n7. Q&A Items");
  await seedQandAItems();

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
