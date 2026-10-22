export const house = {
  name: "Kesari",
  designer: "Bhumika Patel",
  lockup: "Kesari by Bhumika Patel",
  tagline: "Same traditions. New stories.",
  country: "India",
  currency: "INR",
} as const;

export const navLinks = [
  { href: "/whats-new", label: "What's New" },
  { href: "/crafts", label: "Crafts" },
  { href: "/womenswear", label: "Womenswear" },
  { href: "/menswear", label: "Menswear" },
  { href: "/weddings", label: "Weddings" },
  { href: "/atelier", label: "The Atelier" },
  { href: "/world", label: "World of Kesari" },
] as const;

export const footerColumns = [
  {
    title: "The House",
    links: [
      { href: "/whats-new", label: "What's New" },
      { href: "/crafts", label: "Crafts" },
      { href: "/world", label: "World of Kesari" },
      { href: "/atelier", label: "Appointments" },
    ],
  },
  {
    title: "Collections",
    links: [
      { href: "/womenswear", label: "Womenswear" },
      { href: "/menswear", label: "Menswear" },
      { href: "/weddings", label: "Weddings" },
    ],
  },
  {
    title: "Atelier",
    links: [
      { href: "/atelier", label: "Write to the house" },
      { href: "/bag", label: "Bag" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
] as const;
