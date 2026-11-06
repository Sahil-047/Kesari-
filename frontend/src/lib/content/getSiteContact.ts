import { getPageContent } from "./getPageContent";
import type { SiteContent } from "./pages";

/** Published contact settings for RSC (WhatsApp, phone, email). */
export async function getSiteContact(): Promise<SiteContent["contact"]> {
  const { contact } = await getPageContent("site");
  return contact;
}
