import WhatsAppButton from "@/components/WhatsAppButton";
import { getSiteContact } from "@/lib/content/getSiteContact";

/** Loads CMS contact in a Suspense boundary so the root layout can stay static. */
export default async function SiteWhatsApp() {
  const contact = await getSiteContact();
  return <WhatsAppButton initialContact={contact} />;
}
