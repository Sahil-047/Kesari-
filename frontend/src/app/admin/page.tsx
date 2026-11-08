"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FormOutlined,
  PlusOutlined,
  ShoppingOutlined,
  SkinOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/components/admin/AuthProvider";
import { STUDIO } from "@/components/admin/AdminProviders";
import RevenueChart from "@/components/admin/RevenueChart";
import StatusTag from "@/components/admin/StatusTag";
import ScreenHeader, { ScreenBody } from "@/components/admin/ScreenHeader";
import StudioGreeting from "@/components/admin/StudioGreeting";
import { api } from "@/lib/api/client";
import type { ApiOrder, SalesRange, SalesReport } from "@/lib/api/types";
import {
  inr,
  ORDER_TONE,
  ORDER_STATUS_LABEL,
  PAYMENT_TONE,
  PAYMENT_LABEL,
  shortDate,
  SOURCE_LABEL,
} from "@/lib/admin/format";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Divider,
  Grid,
  Progress,
  Row,
  Segmented,
  Statistic,
  Steps,
  Table,
  Typography,
  type TableColumnsType,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const RANGES: { value: SalesRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

function Change({ value }: { value: number | null }) {
  if (value === null) return <StatusTag tone="muted">new</StatusTag>;
  const up = value >= 0;
  return (
    <Flex align="center" gap={6} style={{ fontSize: 12 }}>
      <StatusTag tone={up ? "solid" : "soft"}>
        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value)}%
      </StatusTag>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        vs previous
      </Typography.Text>
    </Flex>
  );
}

function Kpi({ title, value, note }: { title: string; value: string; note?: ReactNode }) {
  return (
    <Card style={{ height: "100%" }} styles={{ body: { padding: "18px 20px" } }}>
      <Statistic title={title} value={value} />
      <div style={{ minHeight: 22, marginTop: 4 }}>
        {typeof note === "string" ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {note}
          </Typography.Text>
        ) : (
          note
        )}
      </div>
    </Card>
  );
}

/** Divided rows: the dashboard's light replacement for Ant's deprecated List. */
function Rows<T>({ items, render, empty }: { items: T[]; render: (item: T) => ReactNode; empty?: string }) {
  if (!items.length) return empty ? <Typography.Paragraph type="secondary">{empty}</Typography.Paragraph> : null;
  return (
    <div>
      {items.map((item, i) => (
        <div key={i}>
          {i > 0 && <Divider style={{ margin: "10px 0" }} />}
          {render(item)}
        </div>
      ))}
    </div>
  );
}

const RECENT_COLUMNS: TableColumnsType<ApiOrder> = [
  { key: "no", title: "Order", render: (_, o) => <Typography.Text strong className="studio-num">{o.orderNumber}</Typography.Text> },
  { key: "customer", title: "Customer", render: (_, o) => o.customer.name },
  { key: "date", title: "Date", render: (_, o) => shortDate(o.placedAt) },
  { key: "total", title: "Total", align: "right", render: (_, o) => inr(o.totalInr) },
  { key: "stage", title: "Stage", render: (_, o) => <StatusTag tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</StatusTag> },
  {
    key: "payment",
    title: "Payment",
    render: (_, o) => <StatusTag tone={PAYMENT_TONE[o.paymentStatus]}>{PAYMENT_LABEL[o.paymentStatus]}</StatusTag>,
  },
];

export default function SalesDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const isNarrow = !screens.md;
  const [range, setRange] = useState<SalesRange>("30d");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<SalesReport>("/admin/analytics/sales", { range })
      .then((r) => !cancelled && setReport(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load sales"));
    return () => {
      cancelled = true;
    };
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    api
      .list("/admin/products", { limit: 1 })
      .then((r) => !cancelled && setProductTotal(r.meta.total))
      .catch(() => !cancelled && setProductTotal(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const s = report?.summary;
  const topMax = Math.max(1, ...(report?.topProducts.map((p) => p.revenue) ?? [1]));
  const empty = report && report.summary.orders === 0 && report.recentOrders.length === 0;

  return (
    <>
      <ScreenHeader
        title={<StudioGreeting name={user?.name.split(" ")[0] ?? "Admin"} />}
        crumbLabel="Dashboard"
        description={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        actions={
          <>
            <div className="studio-scroll-x">
              <Segmented<SalesRange> value={range} onChange={setRange} options={RANGES} block={isNarrow} />
            </div>
            <Button type="primary" icon={<PlusOutlined />} block={isNarrow} onClick={() => router.push("/admin/orders?new=1")}>
              Record a sale
            </Button>
          </>
        }
      />

      <ScreenBody>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Steps
            type={isNarrow ? "default" : "navigation"}
            size="small"
            direction={isNarrow ? "vertical" : "horizontal"}
            current={productTotal ? 1 : 0}
            onChange={(i) => router.push(i === 0 ? "/admin/products" : "/admin/content")}
            items={[
              {
                title: "Catalogue",
                icon: <SkinOutlined />,
                description:
                  productTotal === null
                    ? "Every piece lives here first"
                    : productTotal === 0
                      ? "No products yet — start here"
                      : `${productTotal} product${productTotal === 1 ? "" : "s"}`,
              },
              { title: "Pages", icon: <FormOutlined />, description: "Home, What's New, and the rest" },
            ]}
          />
        </Card>

        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

        <Row gutter={[16, 16]}>
          <Col xs={12} lg={8} xl={4}>
            <Kpi title="Revenue" value={s ? inr(s.revenue, { compact: true }) : "—"} note={s && <Change value={s.revenueChange} />} />
          </Col>
          <Col xs={12} lg={8} xl={4}>
            <Kpi title="Collected" value={s ? inr(s.collected, { compact: true }) : "—"} note="Money received" />
          </Col>
          <Col xs={12} lg={8} xl={4}>
            <Kpi
              title="To collect"
              value={report ? inr(report.outstanding.amount, { compact: true }) : "—"}
              note={report ? `${report.outstanding.orders} open order${report.outstanding.orders === 1 ? "" : "s"}` : undefined}
            />
          </Col>
          <Col xs={12} lg={8} xl={4}>
            <Kpi title="Orders" value={s ? String(s.orders) : "—"} note={s && <Change value={s.ordersChange} />} />
          </Col>
          <Col xs={12} lg={8} xl={4}>
            <Kpi title="Average order" value={s ? inr(s.averageOrder, { compact: true }) : "—"} />
          </Col>
          <Col xs={12} lg={8} xl={4}>
            <Kpi title="Pieces sold" value={s ? String(s.units) : "—"} />
          </Col>
        </Row>

        {empty ? (
          <Card style={{ marginTop: 16 }}>
            <Empty
              image={<ShoppingOutlined style={{ fontSize: 48, color: STUDIO.ink }} />}
              description={
                <>
                  <Typography.Title level={5}>No sales recorded yet</Typography.Title>
                  <Typography.Text type="secondary">
                    Orders from the website bag and WhatsApp land here automatically. Sales made in the store or on the
                    phone can be recorded by hand.
                  </Typography.Text>
                </>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/admin/orders?new=1")}>
                Record the first sale
              </Button>
            </Empty>
          </Card>
        ) : (
          <>
            <Card
              style={{ marginTop: 16 }}
              title={`Revenue · ${range === "12m" ? "by month" : "by day"}`}
              extra={
                !isNarrow ? (
                  <Typography.Text type="secondary">Cancelled orders are not counted</Typography.Text>
                ) : undefined
              }
              loading={!report}
            >
              {report && <RevenueChart data={report.series} />}
            </Card>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={14}>
                <Card title="Best sellers" style={{ height: "100%" }} loading={!report}>
                  <Rows
                    items={report?.topProducts ?? []}
                    empty="No pieces sold in this period."
                    render={(p) => (
                      <Flex key={p.name} align="center" gap={12}>
                        <Avatar shape="square" size={44} src={p.image} icon={<SkinOutlined />} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Flex justify="space-between" gap={12}>
                            <Typography.Text strong ellipsis>
                              {p.name}
                            </Typography.Text>
                            <Typography.Text strong>{inr(p.revenue)}</Typography.Text>
                          </Flex>
                          <Progress percent={Math.round((p.revenue / topMax) * 100)} size="small" status="normal" format={() => `${p.units} sold`} />
                        </div>
                      </Flex>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card title="Pipeline" style={{ height: "100%" }} loading={!report}>
                  <Typography.Text type="secondary">Orders by stage</Typography.Text>
                  <Rows
                    items={report?.byStatus ?? []}
                    empty="No orders in this period."
                    render={(row) => (
                      <Flex key={row.status} justify="space-between">
                        <StatusTag tone={ORDER_TONE[row.status]}>{ORDER_STATUS_LABEL[row.status]}</StatusTag>
                        <Typography.Text strong>{row.count}</Typography.Text>
                      </Flex>
                    )}
                  />
                  <Typography.Text type="secondary" style={{ display: "block", marginTop: 16 }}>
                    Where orders come from
                  </Typography.Text>
                  <Rows
                    items={report?.bySource ?? []}
                    render={(row) => (
                      <Flex key={row.source} justify="space-between">
                        <Flex align="center" gap={6}>
                          {row.source === "whatsapp" && <WhatsAppOutlined />}
                          {SOURCE_LABEL[row.source]}
                        </Flex>
                        <Typography.Text type="secondary">
                          {row.count} · {inr(row.revenue, { compact: true })}
                        </Typography.Text>
                      </Flex>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="Recent orders"
              style={{ marginTop: 16 }}
              styles={{ body: { padding: 0 } }}
              extra={<Link href="/admin/orders">All orders</Link>}
            >
              <Table<ApiOrder>
                rowKey="id"
                size="middle"
                columns={RECENT_COLUMNS}
                dataSource={report?.recentOrders ?? []}
                loading={!report}
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            </Card>
          </>
        )}
      </ScreenBody>
    </>
  );
}
