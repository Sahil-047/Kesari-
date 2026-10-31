import { redirect } from "next/navigation";

/** Pages are now edited from the single Website content form. */
export default function AdminPagesRedirect() {
  redirect("/admin/content");
}
