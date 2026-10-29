export const ROLES = ["admin", "editor"] as const;
export type Role = (typeof ROLES)[number];

/** What the API knows about the signed-in CMS user on each request. */
export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};
