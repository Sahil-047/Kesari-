import { PAGE_DEFS } from "@/lib/admin/pageDefinitions";
import { redirect } from "next/navigation";

export function generateStaticParams() {
  return PAGE_DEFS.map((p) => ({ slug: p.slug }));
}

/** Old per-page links open that page in the Website content form. */
export default async function AdminPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = PAGE_DEFS.find((p) => p.slug === slug);
  redirect(def ? `/admin/content#${def.slug}.${def.sections[0]!.key}` : "/admin/content");
}
