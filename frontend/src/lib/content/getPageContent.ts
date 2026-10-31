import { cacheLife, cacheTag } from "next/cache";
import { API_URL } from "@/lib/api/client";
import { mergeContent, PAGE_DEFAULTS, type PageContentMap, type PageSlug } from "./pages";

/**
 * A page's published CMS content, merged over its defaults. If the API is
 * down or the page was never published, the site falls back to the defaults.
 */
export async function getPageContent<S extends PageSlug>(slug: S): Promise<PageContentMap[S]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`page:${slug}`);

  const defaults = PAGE_DEFAULTS[slug];
  try {
    const res = await fetch(`${API_URL}/pages/${slug}`);
    if (!res.ok) return defaults;
    const json = (await res.json()) as { data?: { content?: unknown } };
    return mergeContent(defaults, json.data?.content);
  } catch {
    return defaults;
  }
}
