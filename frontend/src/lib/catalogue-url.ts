import type { CatalogueFilters, CatalogueProduct, CatalogueSort } from "./catalogue";

type QueryParams = {
  getAll(name: string): string[];
  get(name: string): string | null;
};

type QueryState = { filters: CatalogueFilters; sort: CatalogueSort };
const ownedKeys = ["category", "type", "min", "max", "q", "sort"] as const;

function priceCeiling(products: readonly CatalogueProduct[]): number {
  return products.reduce(
    (ceiling, product) =>
      Number.isFinite(product.price) ? Math.max(ceiling, Math.ceil(product.price)) : ceiling,
    0,
  );
}

function price(value: string | number | null, fallback: number, ceiling: number): number {
  if (value === null || (typeof value === "string" && value.trim() === "")) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(ceiling, Math.max(0, Math.trunc(number))) : fallback;
}

function selections(values: readonly string[], allowed: Set<string>, categories = false): string[] {
  const expanded = values.flatMap((value) =>
    value.split(",").flatMap((part) => {
      const selection = part.trim();
      return categories && selection === "womenswear" ? ["saree", "dress", "lehenga"] : [selection];
    }),
  );
  return [...new Set(expanded.filter((value) => allowed.has(value)))].sort();
}

function normalize(
  input: {
    categories: readonly string[];
    garmentTypes: readonly string[];
    minPrice: string | number | null;
    maxPrice: string | number | null;
    query: string;
  },
  sort: string | null,
  products: readonly CatalogueProduct[],
): QueryState {
  const ceiling = priceCeiling(products);
  const min = price(input.minPrice, 0, ceiling);
  const max = price(input.maxPrice, ceiling, ceiling);
  return {
    filters: {
      categories: selections(input.categories, new Set(products.map((product) => product.category)), true),
      garmentTypes: selections(input.garmentTypes, new Set(products.map((product) => product.garmentType))),
      minPrice: Math.min(min, max),
      maxPrice: Math.max(min, max),
      query: input.query.trim().slice(0, 200).trim(),
    },
    sort: sort === "price-asc" || sort === "price-desc" || sort === "name-asc" ? sort : "featured",
  };
}

export function parseCatalogueQuery(
  params: QueryParams,
  products: readonly CatalogueProduct[],
): QueryState {
  return normalize(
    {
      categories: params.getAll("category"),
      garmentTypes: params.getAll("type"),
      minPrice: params.get("min"),
      maxPrice: params.get("max"),
      query: params.get("q") ?? "",
    },
    params.get("sort"),
    products,
  );
}

export function writeCatalogueQuery(
  params: URLSearchParams,
  filters: CatalogueFilters,
  sort: CatalogueSort,
  products: readonly CatalogueProduct[],
): URLSearchParams {
  const result = new URLSearchParams(params);
  const state = normalize(filters, sort, products);
  for (const key of ownedKeys) result.delete(key);
  for (const category of state.filters.categories) result.append("category", category);
  for (const type of state.filters.garmentTypes) result.append("type", type);
  if (state.filters.minPrice !== 0) result.set("min", String(state.filters.minPrice));
  if (state.filters.maxPrice !== priceCeiling(products)) result.set("max", String(state.filters.maxPrice));
  if (state.filters.query) result.set("q", state.filters.query);
  if (state.sort !== "featured") result.set("sort", state.sort);
  return result;
}
