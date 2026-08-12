type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Memos", href: "/memos" },
  { label: "Builders", href: "/builders" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Toronto", href: "/toronto" },
  { label: "Shop", href: "https://shop.buildcanada.com", external: true },
];

export const TORONTO_NAV_LINKS: NavLink[] = [
  { label: "Canada", href: "/" },
  { label: "Memos", href: "/toronto/memos" },
  { label: "Vote 2026", href: "/toronto/vote/2026" },
  { label: "About", href: "/toronto/about" },
];
