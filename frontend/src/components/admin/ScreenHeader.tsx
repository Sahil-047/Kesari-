"use client";

import { Breadcrumb, Flex, Typography } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";

/** Page header for every CMS screen: breadcrumb, title, summary and actions. */
export default function ScreenHeader({
  title,
  description,
  crumbs,
  actions,
  meta,
  crumbLabel,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: { href: string; label: string }[];
  actions?: ReactNode;
  meta?: ReactNode;
  /** Plain breadcrumb leaf when `title` is a React node. */
  crumbLabel?: string;
}) {
  const breadcrumbLeaf = crumbLabel ?? (typeof title === "string" ? title : "Studio");
  return (
    <div className="studio-screen-header">
      <Breadcrumb
        className="studio-screen-crumbs"
        style={{ marginBottom: 10, fontSize: 12 }}
        items={[
          { title: <Link href="/admin">Studio</Link> },
          ...(crumbs ?? []).map((c) => ({ title: <Link href={c.href}>{c.label}</Link> })),
          { title: breadcrumbLeaf },
        ]}
      />
      <Flex wrap justify="space-between" align="flex-end" gap={12} className="studio-screen-title-row">
        <div style={{ minWidth: 0, flex: "1 1 200px" }}>
          <Flex align="center" gap={10} wrap>
            <Typography.Title level={1} className="studio-display studio-screen-title" style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
              {title}
            </Typography.Title>
            {meta}
          </Flex>
          {description && (
            <Typography.Paragraph type="secondary" className="studio-screen-desc" style={{ margin: "6px 0 0", maxWidth: 720 }}>
              {description}
            </Typography.Paragraph>
          )}
        </div>
        {actions && (
          <Flex wrap gap={8} align="center" className="studio-screen-actions" style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
            {actions}
          </Flex>
        )}
      </Flex>
    </div>
  );
}

/** Standard padded body below a ScreenHeader — fills the content column. */
export function ScreenBody({ children }: { children: ReactNode }) {
  return <div className="studio-screen-body">{children}</div>;
}
