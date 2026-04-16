type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Memos", href: "/memos" },
  { label: "Content", href: "/content" },
  { label: "Projects", href: "/projects" },
  { label: "About Us", href: "/about" },
  { label: "Shop", href: "https://shop.buildcanada.com", external: true },
];
