"use client";

import { Breadcrumb, Flex, Typography } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";

/** Full-bleed CMS canvas — uses the width beside the sider. */
const PAGE_PAD = "28px 28px 40px";

/** Page header for every CMS screen: breadcrumb, title, summary and actions, on the canvas. */
export default function ScreenHeader({
  title,
  description,
  crumbs,
  actions,
  meta,
}: {
  title: string;
  description?: ReactNode;
  crumbs?: { href: string; label: string }[];
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div style={{ padding: "28px 28px 4px", width: "100%" }}>
      <Breadcrumb
        style={{ marginBottom: 10, fontSize: 12 }}
        items={[
          { title: <Link href="/admin">Studio</Link> },
          ...(crumbs ?? []).map((c) => ({ title: <Link href={c.href}>{c.label}</Link> })),
          { title },
        ]}
      />
      <Flex wrap justify="space-between" align="flex-end" gap={16}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Flex align="center" gap={10} wrap>
            <Typography.Title level={1} className="studio-display" style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
              {title}
            </Typography.Title>
            {meta}
          </Flex>
          {description && (
            <Typography.Paragraph type="secondary" style={{ margin: "6px 0 0", maxWidth: 720 }}>
              {description}
            </Typography.Paragraph>
          )}
        </div>
        {actions && (
          <Flex wrap gap={8} align="center">
            {actions}
          </Flex>
        )}
      </Flex>
    </div>
  );
}

/** Standard padded body below a ScreenHeader — fills the content column. */
export function ScreenBody({ children }: { children: ReactNode }) {
  return <div style={{ padding: PAGE_PAD, width: "100%" }}>{children}</div>;
}
