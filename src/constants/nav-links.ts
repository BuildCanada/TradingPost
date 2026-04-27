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
  { label: "Shop", href: "https://shop.buildcanada.com", external: true },
];
