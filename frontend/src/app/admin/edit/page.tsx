import { redirect } from "next/navigation";

/** The Edit is now edited as a section of the What's New page. */
export default function AdminEditRedirect() {
  redirect("/admin/content#whats-new.edit");
}
