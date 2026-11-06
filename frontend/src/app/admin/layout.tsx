import AdminProviders from "@/components/admin/AdminProviders";
import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/components/admin/AuthProvider";
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Kesari Studio",
  robots: { index: false, follow: false },
};

/**
 * Kesari Studio (CMS), built on Ant Design. `data-lenis-prevent` gives the
 * studio native scrolling instead of the storefront's smooth scroll.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio" data-lenis-prevent>
      <AdminProviders>
        <AuthProvider>
          <AdminShell>{children}</AdminShell>
        </AuthProvider>
      </AdminProviders>
    </div>
  );
}
