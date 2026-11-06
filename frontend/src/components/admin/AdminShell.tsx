"use client";

import {
  AppstoreOutlined,
  BarChartOutlined,
  ExportOutlined,
  FileImageOutlined,
  FormOutlined,
  GoldOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  SkinOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { api } from "@/lib/api/client";
import { Avatar, Badge, Button, Dropdown, Flex, Layout, Menu, Spin, Typography, type MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DISPLAY_FONT, STUDIO } from "./AdminProviders";
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
    items: [
      { href: "/admin/content", label: "Website content", icon: <FormOutlined /> },
      { href: "/admin/collections", label: "Collections", icon: <AppstoreOutlined /> },
      { href: "/admin/crafts", label: "Crafts", icon: <GoldOutlined /> },
    ],
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

/** The CMS frame: Ant Pro-style sider navigation, header with the account menu, session guard. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/admin/login";
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState({ enquiries: 0, orders: 0 });

  useEffect(() => {
    if (!loading && !user && !onLogin) router.replace("/admin/login");
    if (!loading && user && onLogin) router.replace("/admin");
  }, [loading, user, onLogin, router]);

  // Badge counts once per session — not on every route change.
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
        ? [{ type: "group" as const, key: `g${gi}`, label: collapsed ? null : group.heading, children: items }]
        : items;
    });
  }, [user, badges, collapsed]);

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <a href="#studio-main" className="studio-skip">
        Skip to content
      </a>
      <Sider
        width={268}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        trigger={null}
        breakpoint="lg"
        onBreakpoint={setCollapsed}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
          borderRight: `1px solid ${STUDIO.border}`,
        }}
      >
        <Flex align="center" gap={12} style={{ height: 64, padding: collapsed ? "0 22px" : "0 22px" }}>
          <Avatar
            shape="square"
            size={32}
            style={{
              background: STUDIO.ink,
              color: "#e9c46a",
              flexShrink: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 6,
            }}
          >
            K
          </Avatar>
          {!collapsed && (
            <span style={{ lineHeight: 1.2, whiteSpace: "nowrap" }}>
              <Typography.Text strong style={{ display: "block", fontSize: 17, fontFamily: DISPLAY_FONT }}>
                Kesari Studio
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Catalogue first · then the site
              </Typography.Text>
            </span>
          )}
        </Flex>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          items={menuItems}
          className="studio-sider-menu"
          style={{ borderInlineEnd: 0, padding: "10px 10px 24px" }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            padding: "0 20px 0 8px",
            borderBottom: `1px solid ${STUDIO.border}`,
            backdropFilter: "saturate(180%) blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((c) => !c)}
            style={{ width: 40, height: 40, color: STUDIO.muted }}
          />
          <Flex align="center" gap={8}>
            <Button type="text" icon={<ExportOutlined />} href="/" target="_blank" style={{ color: STUDIO.muted }}>
              View website
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
                <span style={{ fontWeight: 500 }}>{user.name}</span>
                <Typography.Text type="secondary" style={{ fontSize: 12, textTransform: "capitalize" }}>
                  {user.role}
                </Typography.Text>
              </Button>
            </Dropdown>
          </Flex>
        </Header>
        <Content id="studio-main" tabIndex={-1} style={{ minWidth: 0, outline: "none" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
