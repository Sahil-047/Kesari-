"use client";

import { api } from "@/lib/api/client";
import { Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";

type CategoryOption = { name: string; slug: string };

type Props = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  /** Use authenticated admin list (default) or public /categories. */
  admin?: boolean;
};

/**
 * Master category picker. Typing a new name offers “Add …” — saving the
 * product upserts that category on the API.
 */
export default function CategorySelect({
  value,
  onChange,
  disabled,
  required,
  admin = true,
}: Props) {
  const [items, setItems] = useState<CategoryOption[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let alive = true;
    const path = admin ? "/admin/categories/options" : "/categories";
    api
      .get<CategoryOption[]>(path)
      .then((list) => {
        if (alive) setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, [admin]);

  const options = useMemo(() => {
    const base = (items ?? []).map((c) => ({
      value: c.slug,
      label: c.name,
    }));
    const q = search.trim();
    if (!q) return base;
    const slug = q
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug || base.some((o) => o.value === slug || o.label.toLowerCase() === q.toLowerCase())) {
      return base;
    }
    return [{ value: slug, label: `Add “${q}”` }, ...base];
  }, [items, search]);

  if (!items) return <Spin size="small" />;

  return (
    <Select
      showSearch
      allowClear={!required}
      disabled={disabled}
      value={value || undefined}
      placeholder="Choose or type a category"
      options={options}
      filterOption={(input, option) =>
        String(option?.label ?? "")
          .toLowerCase()
          .includes(input.toLowerCase()) ||
        String(option?.value ?? "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      onSearch={setSearch}
      onChange={(v) => onChange(v ?? "")}
      style={{ width: "100%" }}
    />
  );
}
