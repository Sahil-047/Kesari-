"use client";

import { PlusOutlined } from "@ant-design/icons";
import OrderForm from "@/components/admin/OrderForm";
import ScreenHeader, { ScreenBody } from "@/components/admin/ScreenHeader";
import { api, type PageMeta } from "@/lib/api/client";
import type { ApiOrder } from "@/lib/api/types";
import {
  inr,
  ORDER_TONE,
  ORDER_STATUS_LABEL,
  optionsOf,
  PAYMENT_TONE,
  PAYMENT_LABEL,
  shortDate,
  SOURCE_LABEL,
} from "@/lib/admin/format";
import { Alert, Button, Card, Empty, Flex, Input, Select, Table, Typography, type TableColumnsType } from "antd";
import { STUDIO } from "@/components/admin/AdminProviders";
import StatusTag from "@/components/admin/StatusTag";
import { useCallback, useEffect, useState } from "react";

const FILTERS = [
  { name: "status", label: "All stages", options: ORDER_STATUS_LABEL },
  { name: "paymentStatus", label: "All payments", options: PAYMENT_LABEL },
  { name: "source", label: "All channels", options: SOURCE_LABEL },
] as const;

const COLUMNS: TableColumnsType<ApiOrder> = [
  { key: "no", title: "Order", render: (_, o) => <Typography.Text strong className="studio-num">{o.orderNumber}</Typography.Text> },
  { key: "date", title: "Date", render: (_, o) => shortDate(o.placedAt) },
  {
    key: "customer",
    title: "Customer",
    render: (_, o) => (
      <>
        <Typography.Text strong>{o.customer.name}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {o.customer.phone}
        </Typography.Text>
      </>
    ),
  },
  { key: "pieces", title: "Pieces", align: "right", render: (_, o) => o.items.reduce((n, i) => n + i.quantity, 0) },
  { key: "total", title: "Total", align: "right", render: (_, o) => <Typography.Text strong>{inr(o.totalInr)}</Typography.Text> },
  { key: "paid", title: "Paid", align: "right", render: (_, o) => inr(o.amountPaidInr) },
  { key: "stage", title: "Stage", render: (_, o) => <StatusTag tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</StatusTag> },
  {
    key: "payment",
    title: "Payment",
    render: (_, o) => <StatusTag tone={PAYMENT_TONE[o.paymentStatus]}>{PAYMENT_LABEL[o.paymentStatus]}</StatusTag>,
  },
  { key: "channel", title: "Channel", render: (_, o) => SOURCE_LABEL[o.source] },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ApiOrder | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.list<ApiOrder>("/admin/orders", { page, limit: 20, search, ...filters });
      setOrders(r.items);
      setMeta(r.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and query change
    load();
  }, [load]);

  // The dashboard's "Record a sale" links here with ?new=1.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("new") === "1") setEditing("new");
  }, []);

  return (
    <>
      <ScreenHeader
        title="Orders"
        description={
          meta ? `${meta.total} order${meta.total === 1 ? "" : "s"} from the website, WhatsApp and the store` : undefined
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing("new")}>
            Record a sale
          </Button>
        }
      />

      <ScreenBody>
        <Card styles={{ body: { padding: 0 } }}>
          <Flex wrap gap={8} style={{ padding: "12px 16px", borderBottom: `1px solid ${STUDIO.hairline}` }}>
            <Input.Search
              allowClear
              placeholder="Search order no., name, phone…"
              style={{ maxWidth: 300 }}
              onSearch={(v) => {
                setPage(1);
                setSearch(v);
              }}
            />
            {FILTERS.map((f) => (
              <Select
                key={f.name}
                allowClear
                placeholder={f.label}
                style={{ minWidth: 160 }}
                value={filters[f.name] || undefined}
                onChange={(v) => {
                  setPage(1);
                  setFilters((p) => ({ ...p, [f.name]: v ?? "" }));
                }}
                options={optionsOf(f.options)}
              />
            ))}
          </Flex>

          {error && <Alert type="error" showIcon message={error} style={{ margin: 16 }} />}

          <Table<ApiOrder>
            rowKey="id"
            columns={COLUMNS}
            dataSource={orders}
            loading={loading}
            scroll={{ x: "max-content" }}
            onRow={(o) => ({ onClick: () => setEditing(o), style: { cursor: "pointer" } })}
            locale={{
              emptyText: (
                <Empty description="No orders here yet">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing("new")}>
                    Record a sale
                  </Button>
                </Empty>
              ),
            }}
            pagination={
              meta && meta.pages > 1
                ? { current: meta.page, pageSize: meta.limit, total: meta.total, showSizeChanger: false, onChange: setPage }
                : false
            }
          />
        </Card>
      </ScreenBody>

      {editing && (
        <OrderForm
          order={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}
