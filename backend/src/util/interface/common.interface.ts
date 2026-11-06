import type { RoleEnum } from "../enum/permission.enum.js";

/** An image stored on S3 (or a site-relative path for existing assets). */
export interface IImage {
  url: string;
  key?: string;
  alt?: string;
  width?: number;
  height?: number;
}

/** What the API knows about the signed-in CMS user on each request. */
export interface IAuthUser {
  id: string;
  email: string;
  role: RoleEnum;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: RoleEnum;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IPaginated<T> {
  items: T[];
  meta: IPaginationMeta;
}

export interface IPageQuery {
  page?: number;
  limit?: number;
}
