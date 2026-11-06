"use client";

import { DeleteOutlined, PlusOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { api, ApiRequestError } from "@/lib/api/client";
import type { ApiOrder, ApiOrderItem, ApiProduct } from "@/lib/api/types";
import {
  inr,
  ORDER_STATUS_LABEL,
  optionsOf,
  PAYMENT_LABEL,
  PAYMENT_METHOD_LABEL,
  SOURCE_LABEL,
} from "@/lib/admin/format";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

type ProductOption = ApiProduct & { images?: { url: string }[] };

type Draft = Omit<ApiOrder, "id" | "orderNumber" | "subtotalInr" | "totalInr" | "placedAt" | "paymentStatus"> & {
  placedAt: string;
  paymentStatus: ApiOrder["paymentStatus"] | "";
};

const emptyLine = (): ApiOrderItem => ({ name: "", priceInr: 0, quantity: 1 });

function toDraft(order: ApiOrder | null): Draft {
  if (!order) {
    return {
      source: "manual",
      customer: { name: "", phone: "", email: "", city: "", address: "" },
      items: [emptyLine()],
      discountInr: 0,
      amountPaidInr: 0,
      status: "confirmed",
      paymentStatus: "",
      paymentMethod: "",
      note: "",
      internalNote: "",
      placedAt: new Date().toISOString().slice(0, 10),
    };
  }
  return { ...order, paymentStatus: "", placedAt: order.placedAt.slice(0, 10) };
}

/** wa.me link from a phone number; Indian 10-digit numbers get +91. */
export function whatsappLink(phone: string, text = ""): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Record a sale or edit an order, in an Ant Drawer. Totals preview live; the API recomputes them. */
export default function OrderForm({
  order,
  onClose,
  onSaved,
}: {
  order: ApiOrder | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<Draft>(() => toDraft(order));
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .list<ProductOption>("/admin/products", { limit: 100 })
      .then((r) => setProducts(r.items))
      .catch(() => setProducts([]));
  }, []);

  const subtotal = draft.items.reduce((sum, i) => sum + (i.priceInr || 0) * (i.quantity || 0), 0);
  const total = Math.max(0, subtotal - (draft.discountInr || 0));
  const balance = Math.max(0, total - (draft.amountPaidInr || 0));

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setCustomer = (key: keyof Draft["customer"], value: string) =>
    setDraft((d) => ({ ...d, customer: { ...d.customer, [key]: value } }));
  const setLine = (i: number, patch: Partial<ApiOrderItem>) =>
    setDraft((d) => ({ ...d, items: d.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));

  const pickProduct = (i: number, id: string | undefined) => {
    const p = products.find((x) => x.id === id);
    if (!p) return setLine(i, { product: undefined, slug: undefined });
    setLine(i, { product: p.id, slug: p.slug, name: p.name, priceInr: p.priceInr, image: p.images?.[0]?.url });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      source: draft.source,
      customer: Object.fromEntries(Object.entries(draft.customer).filter(([, v]) => v)),
      items: draft.items
        .filter((i) => i.name.trim())
        .map(({ product, slug, name, image, priceInr, quantity }) => ({
          ...(product && { product }),
          ...(slug && { slug }),
          ...(image && { image }),
          name,
          priceInr: Math.round(priceInr || 0),
          quantity: quantity || 1,
        })),
      discountInr: Math.round(draft.discountInr || 0),
      amountPaidInr: Math.round(draft.amountPaidInr || 0),
      status: draft.status,
      ...(draft.paymentStatus && { paymentStatus: draft.paymentStatus }),
      ...(draft.paymentMethod && { paymentMethod: draft.paymentMethod }),
      ...(draft.note && { note: draft.note }),
      ...(draft.internalNote && { internalNote: draft.internalNote }),
      placedAt: draft.placedAt,
    };
    try {
      if (order) await api.patch(`/admin/orders/${order.id}`, payload);
      else await api.post("/admin/orders", payload);
      message.success(order ? "Order saved" : "Sale recorded");
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.details?.length
          ? err.details.map((d) => d.message).join(" · ")
          : err instanceof Error
            ? err.message
            : "Could not save",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!order) return;
    try {
      await api.delete(`/admin/orders/${order.id}`);
      message.success(`Order ${order.orderNumber} deleted`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const wa = whatsappLink(
    draft.customer.phone,
    order ? `Hello ${draft.customer.name}, this is Kesari about your order ${order.orderNumber}.` : "",
  );

  return (
    <Drawer
      open
      onClose={onClose}
      size={800}
      title={order ? `Order ${order.orderNumber}` : "Record a sale"}
      styles={{ body: { background: "#fafaf9" } }}
      extra={
        wa && (
          <Button icon={<WhatsAppOutlined />} href={wa} target="_blank">
            WhatsApp
          </Button>
        )
      }
      footer={
        <Flex justify="space-between" align="center">
          {order ? (
            <Popconfirm
              title={`Delete order ${order.orderNumber}?`}
              description="This cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={remove}
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          ) : (
            <span />
          )}
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={saving} onClick={save}>
              {order ? "Save order" : `Record sale · ${inr(total)}`}
            </Button>
          </Space>
        </Flex>
      }
    >
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

      <Form layout="vertical" component="div">
        <Flex vertical gap={16}>
          <Card size="small" title="Customer">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Name" required>
                  <Input value={draft.customer.name} onChange={(e) => setCustomer("name", e.target.value)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Phone / WhatsApp" required>
                  <Input
                    placeholder="+91 98765 43210"
                    value={draft.customer.phone}
                    onChange={(e) => setCustomer("phone", e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Email">
                  <Input type="email" value={draft.customer.email ?? ""} onChange={(e) => setCustomer("email", e.target.value)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="City">
                  <Input value={draft.customer.city ?? ""} onChange={(e) => setCustomer("city", e.target.value)} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Delivery address" style={{ marginBottom: 0 }}>
                  <Input.TextArea
                    autoSize={{ minRows: 2 }}
                    value={draft.customer.address ?? ""}
                    onChange={(e) => setCustomer("address", e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="Pieces">
            <Flex vertical gap={12}>
              {draft.items.map((item, i) => (
                <Card key={i} size="small" type="inner">
                  <Row gutter={12} align="bottom">
                    <Col xs={24} md={12}>
                      <Form.Item label="Product" style={{ marginBottom: 8 }}>
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Custom item (type the name below)"
                          // A deleted product reads as a custom item, not a raw id.
                          value={products.some((p) => p.id === item.product) ? item.product : undefined}
                          onChange={(v) => pickProduct(i, v)}
                          options={products.map((p) => ({ value: p.id, label: `${p.name} · ${inr(p.priceInr)}` }))}
                        />
                      </Form.Item>
                      <Input placeholder="Item name" value={item.name} onChange={(e) => setLine(i, { name: e.target.value })} />
                    </Col>
                    <Col xs={10} md={5}>
                      <Form.Item label="Price" style={{ marginBottom: 0 }}>
                        <InputNumber
                          prefix="₹"
                          min={0}
                          style={{ width: "100%" }}
                          value={item.priceInr}
                          onChange={(v) => setLine(i, { priceInr: v ?? 0 })}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Item label="Qty" style={{ marginBottom: 0 }}>
                        <InputNumber
                          min={1}
                          style={{ width: "100%" }}
                          value={item.quantity}
                          onChange={(v) => setLine(i, { quantity: v ?? 1 })}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={4}>
                      <Flex vertical align="end" gap={4}>
                        <Typography.Text strong>{inr((item.priceInr || 0) * (item.quantity || 0))}</Typography.Text>
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          aria-label="Remove item"
                          disabled={draft.items.length === 1}
                          onClick={() => set("items", draft.items.filter((_, j) => j !== i))}
                        />
                      </Flex>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button type="dashed" block icon={<PlusOutlined />} onClick={() => set("items", [...draft.items, emptyLine()])}>
                Add a piece
              </Button>
            </Flex>

            <Flex justify="end" style={{ marginTop: 16 }}>
              <Descriptions
                column={1}
                size="small"
                bordered
                style={{ width: 360 }}
                items={[
                  { key: "sub", label: "Subtotal", children: inr(subtotal) },
                  {
                    key: "disc",
                    label: "Discount",
                    children: (
                      <InputNumber
                        prefix="₹"
                        min={0}
                        size="small"
                        style={{ width: "100%" }}
                        value={draft.discountInr}
                        onChange={(v) => set("discountInr", v ?? 0)}
                      />
                    ),
                  },
                  { key: "total", label: <strong>Total</strong>, children: <strong>{inr(total)}</strong> },
                  {
                    key: "paid",
                    label: "Paid so far",
                    children: (
                      <InputNumber
                        prefix="₹"
                        min={0}
                        size="small"
                        style={{ width: "100%" }}
                        value={draft.amountPaidInr}
                        onChange={(v) => set("amountPaidInr", v ?? 0)}
                      />
                    ),
                  },
                  {
                    key: "bal",
                    label: balance > 0 ? "Balance to collect" : "Fully paid",
                    children: (
                      <Typography.Text strong type={balance > 0 ? "warning" : "success"}>
                        {inr(balance)}
                      </Typography.Text>
                    ),
                  },
                ]}
              />
            </Flex>
          </Card>

          <Card size="small" title="Status">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Stage">
                  <Select value={draft.status} onChange={(v) => set("status", v)} options={optionsOf(ORDER_STATUS_LABEL)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Payment status">
                  <Select
                    value={draft.paymentStatus}
                    onChange={(v) => set("paymentStatus", v)}
                    options={[{ value: "", label: "Automatic (from amounts)" }, ...optionsOf(PAYMENT_LABEL)]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Paid by">
                  <Select
                    allowClear
                    placeholder="—"
                    value={draft.paymentMethod || undefined}
                    onChange={(v) => set("paymentMethod", v ?? "")}
                    options={optionsOf(PAYMENT_METHOD_LABEL)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Came from">
                  <Select value={draft.source} onChange={(v) => set("source", v)} options={optionsOf(SOURCE_LABEL)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Order date">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="D MMM YYYY"
                    allowClear={false}
                    value={dayjs(draft.placedAt)}
                    onChange={(d) => d && set("placedAt", d.format("YYYY-MM-DD"))}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Customer's note">
                  <Input.TextArea autoSize={{ minRows: 2 }} value={draft.note ?? ""} onChange={(e) => set("note", e.target.value)} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Internal note" extra="Only the team sees this" style={{ marginBottom: 0 }}>
                  <Input.TextArea
                    autoSize={{ minRows: 2 }}
                    value={draft.internalNote ?? ""}
                    onChange={(e) => set("internalNote", e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Flex>
      </Form>
    </Drawer>
  );
}
