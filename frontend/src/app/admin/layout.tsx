import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/components/admin/AuthProvider";
import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./admin.css";

const cmsSans = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cms",
  display: "swap",
});

const cmsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cms-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kesari Studio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`cms ${cmsSans.variable} ${cmsMono.variable}`}>
      <AuthProvider>
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    </div>
  );
}
