import { trusted } from "mongoose";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive "contains" across fields. The operators are marked trusted
 * so the global sanitizeFilter leaves them alone; the term itself is escaped.
 */
export function searchFilter(fields: string[], term: string) {
  const pattern = escapeRegex(term);
  return {
    $or: fields.map((field) => ({
      [field]: trusted({ $regex: pattern, $options: "i" }),
    })),
  };
}
