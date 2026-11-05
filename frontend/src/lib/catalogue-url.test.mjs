import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseCatalogueQuery, writeCatalogueQuery } from "./catalogue-url.ts";

const { products } = JSON.parse(
  await readFile(new URL("./lookbook-products.json", import.meta.url), "utf8"),
);
const ceiling = Math.max(...products.map((product) => product.price));
const defaults = {
  categories: [],
  garmentTypes: [],
  minPrice: 0,
  maxPrice: ceiling,
  query: "",
};
const parse = (query = "", source = products) =>
  parseCatalogueQuery(new URLSearchParams(query), source);
const write = (filters = defaults, sort = "featured", query = "", source = products) =>
  writeCatalogueQuery(new URLSearchParams(query), filters, sort, source);

test("defaults use the actual catalogue ceiling and accept structural read-only params", () => {
  assert.equal(products.length, 17);
  assert.deepEqual(parse(), { filters: defaults, sort: "featured" });
  const params = new URLSearchParams("category=saree&sort=price-desc");
  const readonlyParams = {
    getAll: (name) => params.getAll(name),
    get: (name) => params.get(name),
  };
  assert.deepEqual(parseCatalogueQuery(readonlyParams, products), parse(params));
});

test("repeated and comma-separated categories and types are validated, deduplicated and canonical", () => {
  const state = parse(
    "category=saree,lehenga,unknown&category=lehenga&category=%20saree%20" +
    "&type=saree,unknown&type=kurta-and-trousers-set&type=saree",
  );
  assert.deepEqual(state.filters.categories, ["lehenga", "saree"]);
  assert.deepEqual(state.filters.garmentTypes, ["kurta-and-trousers-set", "saree"]);
  assert.equal(write(state.filters).toString(),
    "category=lehenga&category=saree&type=kurta-and-trousers-set&type=saree");
});

test("womenswear expands only existing women's categories, never menswear", () => {
  assert.deepEqual(parse("category=womenswear,saree").filters.categories, ["dress", "lehenga", "saree"]);
  const subset = products.filter((product) => ["saree", "menswear"].includes(product.category));
  assert.deepEqual(parse("category=womenswear", subset).filters.categories, ["saree"]);
  assert.deepEqual(parse("category=womenswear,menswear").filters.categories,
    ["dress", "lehenga", "menswear", "saree"]);
  assert.equal(write({ ...defaults, categories: ["womenswear"] }).toString(),
    "category=dress&category=lehenga&category=saree");
});

test("prices fall back for absent, blank, invalid and nonfinite bounds", () => {
  for (const value of ["", " ", "invalid", "NaN", "Infinity", "-Infinity", "1e999"]) {
    const params = new URLSearchParams({ min: value, max: value });
    assert.deepEqual(parse(params).filters, defaults, value);
  }
  assert.equal(parse("min=100").filters.maxPrice, ceiling);
  assert.equal(parse("max=100").filters.minPrice, 0);
});

test("prices become clamped nonnegative integers and inverted bounds are swapped", () => {
  for (const [query, expected] of [
    ["min=-20&max=999999999", [0, ceiling]],
    ["min=200.9&max=100.7", [100, 200]],
    ["min=41999&max=41999", [41999, 41999]],
    ["min=999999999&max=-10", [0, ceiling]],
    ["min=-10&max=-1", [0, 0]],
  ]) {
    const { filters } = parse(query);
    assert.deepEqual([filters.minPrice, filters.maxPrice], expected, query);
  }
});

test("search is trimmed and limited to 200 characters without lowercasing", () => {
  assert.equal(parse(new URLSearchParams({ q: "  VaSuDh  " })).filters.query, "VaSuDh");
  assert.equal(parse("q=%20%09%0A").filters.query, "");
  const query = "A".repeat(205);
  const filters = { ...defaults, query: `  ${query}  ` };
  assert.equal(parse(write(filters)).filters.query, "A".repeat(200));
});

test("only supported sorts survive parsing and writing", () => {
  for (const sort of ["featured", "price-asc", "price-desc", "name-asc", "unknown", "", "PRICE-ASC"]) {
    const expected = ["price-asc", "price-desc", "name-asc"].includes(sort) ? sort : "featured";
    assert.equal(parse(new URLSearchParams({ sort })).sort, expected);
    assert.equal(write(defaults, sort).get("sort"), expected === "featured" ? null : expected);
  }
});

test("writing returns a copy, removes all old owned values, and preserves unrelated repeated params", () => {
  const params = new URLSearchParams(
    "utm_source=mail&utm_source=ad&campaign=&page=2&category=bad&category=dress" +
    "&type=bad&min=4&max=5&q=old&sort=bad&sort=price-desc",
  );
  const snapshot = params.toString();
  const result = writeCatalogueQuery(params, defaults, "featured", products);
  assert.notStrictEqual(result, params);
  assert.equal(params.toString(), snapshot);
  assert.deepEqual([...result], [
    ["utm_source", "mail"], ["utm_source", "ad"], ["campaign", ""], ["page", "2"],
  ]);
});

test("writing normalizes dirty filters without mutating filters or products", () => {
  const source = Object.freeze(products.map((product) => Object.freeze({ ...product })));
  const filters = Object.freeze({
    categories: Object.freeze(["saree", "unknown", "lehenga", "saree"]),
    garmentTypes: Object.freeze(["saree", "invalid", "saree"]),
    minPrice: 50000.9,
    maxPrice: 10000.8,
    query: "  Silk  ",
  });
  const snapshot = structuredClone({ filters, source });
  const result = writeCatalogueQuery(new URLSearchParams("track=1"), filters, "price-asc", source);
  assert.equal(result.toString(),
    "track=1&category=lehenga&category=saree&type=saree&min=10000&max=50000&q=Silk&sort=price-asc");
  assert.deepEqual({ filters, source }, snapshot);
  for (const [minPrice, maxPrice] of [[NaN, Infinity], [-Infinity, NaN]]) {
    assert.equal(write({ ...defaults, minPrice, maxPrice }).toString(), "");
  }
});

test("canonical writing is idempotent and parsed state round trips", () => {
  const state = parse("category=womenswear&type=saree&min=200&max=50000&q=Silk&sort=name-asc");
  const canonical = write(state.filters, state.sort, "utm_campaign=spring");
  assert.deepEqual(parse(canonical), state);
  assert.equal(writeCatalogueQuery(canonical, state.filters, state.sort, products).toString(), canonical.toString());
  assert.equal(write().toString(), "");
});

test("empty catalogue has a safe zero ceiling and no valid selections", () => {
  const state = parse("category=womenswear,menswear&type=saree&min=100&max=-5", []);
  assert.deepEqual(state, {
    filters: { ...defaults, minPrice: 0, maxPrice: 0 },
    sort: "featured",
  });
  assert.equal(write({ ...defaults, categories: ["saree"], garmentTypes: ["saree"] },
    "featured", "utm_source=mail&min=10&max=20", []).toString(), "utm_source=mail");
});
