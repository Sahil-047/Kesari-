"use client";

import {
  BarChartOutlined,
  ExportOutlined,
  FileImageOutlined,
  FormOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  SkinOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import logoDark from "@/assets/brand/kesari-logo.png";
import { api } from "@/lib/api/client";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  Spin,
  Typography,
  type MenuProps,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { STUDIO } from "./AdminProviders";
import { useAuth } from "./AuthProvider";

const { Sider, Header, Content } = Layout;

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
  badge?: "enquiries" | "orders";
};

const NAV: { heading?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: <BarChartOutlined /> }] },
  {
    heading: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: <SkinOutlined /> },
      { href: "/admin/media", label: "Media library", icon: <FileImageOutlined /> },
    ],
  },
  {
    heading: "Website",
    items: [{ href: "/admin/content", label: "Pages", icon: <FormOutlined /> }],
  },
  {
    heading: "Sales",
    items: [{ href: "/admin/orders", label: "Orders", icon: <ShoppingOutlined />, badge: "orders" }],
  },
  {
    heading: "House",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: <InboxOutlined />, badge: "enquiries" },
      { href: "/admin/users", label: "Team", icon: <TeamOutlined />, adminOnly: true },
    ],
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** The CMS frame: desktop sider, mobile drawer, session guard. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const onLogin = pathname === "/admin/login";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badges, setBadges] = useState({ enquiries: 0, orders: 0 });

  useEffect(() => {
    if (!loading && !user && !onLogin) router.replace("/admin/login");
    if (!loading && user && onLogin) router.replace("/admin");
  }, [loading, user, onLogin, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const count = (path: string, status: string) =>
      api
        .list(path, { status, limit: 1 })
        .then((r) => r.meta.total)
        .catch(() => 0);
    Promise.all([count("/admin/enquiries", "new"), count("/admin/orders", "pending")]).then(
      ([enquiries, orders]) => {
        if (!cancelled) setBadges({ enquiries, orders });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  const menuCollapsed = isMobile ? false : collapsed;

  const menuItems = useMemo<MenuProps["items"]>(() => {
    if (!user) return [];
    return NAV.flatMap<NonNullable<MenuProps["items"]>[number]>((group, gi) => {
      const items = group.items
        .filter((n) => !n.adminOnly || user.role === "admin")
        .map((n) => {
          const badge = n.badge ? badges[n.badge] : 0;
          return {
            key: n.href,
            icon: n.icon,
            label: (
              <Link href={n.href}>
                <Flex justify="space-between" align="center">
                  <span>{n.label}</span>
                  {badge > 0 && <Badge count={badge} size="small" color={STUDIO.ink} />}
                </Flex>
              </Link>
            ),
          };
        });
      if (!items.length) return [];
      return group.heading
        ? [{ type: "group" as const, key: `g${gi}`, label: menuCollapsed ? null : group.heading, children: items }]
        : items;
    });
  }, [user, badges, menuCollapsed]);

  const selected =
    NAV.flatMap((g) => g.items)
      .map((n) => n.href)
      .filter((href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)))
      .sort((a, b) => b.length - a.length)[0] ?? "/admin";

  if (onLogin) return <>{children}</>;
  if (loading || !user) {
    return (
      <Flex vertical align="center" justify="center" gap={16} style={{ minHeight: "100vh" }}>
        <Spin size="large" />
        <Typography.Text type="secondary">Opening Kesari Studio…</Typography.Text>
      </Flex>
    );
  }

  const brand = (
    <div className="studio-brand-lockup" data-compact={menuCollapsed ? "true" : "false"}>
      <Image
        src={logoDark}
        alt="Kesari"
        height={34}
        priority
        style={{ width: "auto", height: menuCollapsed ? 28 : 34 }}
      />
      {!menuCollapsed && (
        <div className="studio-brand-copy">
          <strong>Kesari Studio</strong>
          <span>Catalogue first · then the site</span>
        </div>
      )}
    </div>
  );

  const navMenu = (
    <>
      {brand}
      <Menu
        mode="inline"
        selectedKeys={[selected]}
        items={menuItems}
        className="studio-sider-menu"
        style={{ borderInlineEnd: 0, padding: "10px 10px 24px" }}
        onClick={() => {
          if (isMobile) setMobileOpen(false);
        }}
      />
    </>
  );

  return (
    <Layout className="studio-shell" style={{ minHeight: "100vh" }}>
      <a href="#studio-main" className="studio-skip">
        Skip to content
      </a>

      {!isMobile && (
        <Sider
          width={272}
          collapsedWidth={76}
          collapsible
          collapsed={collapsed}
          trigger={null}
          className="studio-sider"
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "auto",
          }}
        >
          {navMenu}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={288}
          closable={false}
          className="studio-nav-drawer"
          styles={{ body: { padding: 0, background: STUDIO.surface } }}
        >
          {navMenu}
        </Drawer>
      )}

      <Layout style={{ minWidth: 0 }}>
        <Header
          className="studio-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            padding: isMobile ? "0 12px 0 4px" : "0 20px 0 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Flex align="center" gap={4} style={{ minWidth: 0 }}>
            <Button
              type="text"
              aria-label={isMobile ? "Open menu" : collapsed ? "Expand menu" : "Collapse menu"}
              icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed((c) => !c))}
              style={{ width: 40, height: 40, color: STUDIO.muted, flexShrink: 0 }}
            />
            {isMobile && (
              <Typography.Text strong className="studio-display" style={{ fontSize: 16, whiteSpace: "nowrap" }}>
                Studio
              </Typography.Text>
            )}
          </Flex>
          <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
            <Button
              type="text"
              icon={<ExportOutlined />}
              href="/"
              target="_blank"
              aria-label="View website"
              style={{ color: STUDIO.muted }}
            >
              <span className="studio-header-site-label">View website</span>
            </Button>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: "who", label: user.email, disabled: true },
                  { type: "divider" },
                  { key: "logout", icon: <LogoutOutlined />, label: "Sign out", danger: true },
                ],
                onClick: ({ key }) => key === "logout" && logout(),
              }}
            >
              <Button type="text" aria-label={`Account menu for ${user.name}`} style={{ height: 40, paddingInline: 8 }}>
                <Avatar size={26} style={{ background: STUDIO.ink, fontSize: 11, fontWeight: 600 }}>
                  {initials(user.name)}
                </Avatar>
                {!isMobile && (
                  <>
                    <span style={{ fontWeight: 500 }}>{user.name}</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12, textTransform: "capitalize" }}>
                      {user.role}
                    </Typography.Text>
                  </>
                )}
              </Button>
            </Dropdown>
          </Flex>
        </Header>
        <Content id="studio-main" tabIndex={-1} className="studio-main" style={{ minWidth: 0, outline: "none" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
