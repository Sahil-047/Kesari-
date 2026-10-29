import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/components/admin/AuthProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS | Kesari",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
