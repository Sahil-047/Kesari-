import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import config from "../config/index.js";
import { PublishStatusEnum } from "../util/enum/common.enum.js";

export const objectId = () =>
  yup.string().test("objectId", "Invalid id", (v) => v === undefined || isValidObjectId(v));

export const slug = () =>
  yup
    .string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

/** "YYYY-MM-DD" */
export const isoDate = () =>
  yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-06");

/** Treats "" as "not given", as HTML forms send empty strings. */
export const blankToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const idParams = yup.object({ id: objectId().required() });
export const slugParams = yup.object({ slug: slug().required() });

export const publishStatus = () => yup.string().oneOf(Object.values(PublishStatusEnum));

export const paginationQuery = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(config.commonConfig.pageSize),
});

/** Absolute URL, or a site-relative path for assets already in the frontend. */
export const assetUrl = () =>
  yup
    .string()
    .trim()
    .test("assetUrl", "Invalid URL", (v) => v === undefined || v.startsWith("/") || URL.canParse(v));

/**
 * Accepts a URL string or a CMS image object `{ url }`, then validates as assetUrl.
 * Empty string / null clears to undefined (useful on PATCH).
 */
export const assetUrlFromImage = () =>
  yup
    .mixed()
    .transform((v) => {
      if (v == null || v === "") return undefined;
      if (typeof v === "string") return v.trim() || undefined;
      if (typeof v === "object" && v !== null && typeof (v as { url?: unknown }).url === "string") {
        return (v as { url: string }).url.trim() || undefined;
      }
      return v;
    })
    .test(
      "assetUrlFromImage",
      "Invalid URL",
      (v) => v === undefined || (typeof v === "string" && (v.startsWith("/") || URL.canParse(v))),
    );

export const imageInput = () =>
  yup.object({
    url: assetUrl().required(),
    key: yup.string().trim().optional(),
    alt: yup.string().trim().max(300).default(""),
    width: yup.number().integer().positive().optional(),
    height: yup.number().integer().positive().optional(),
  });

/** An optional nested image: absent stays absent instead of becoming `{}`. */
export const optionalImage = () => imageInput().default(undefined).optional();

export const textList = () => yup.array(yup.string().trim().min(1).max(500).required()).max(50);

/** Honeypot: real visitors never see or fill this field. */
export const honeypot = () => yup.string().max(0, "Spam detected").optional();

export type InferType<S extends yup.ISchema<unknown>> = yup.InferType<S>;
