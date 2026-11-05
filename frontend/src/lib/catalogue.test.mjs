import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { filterCatalogue, garmentLabel } from "./catalogue.ts";

const catalogue = JSON.parse(
  await readFile(new URL("./lookbook-products.json", import.meta.url), "utf8"),
);
const products = catalogue.products;
const resetFilters = {
  categories: [],
  garmentTypes: [],
  minPrice: 0,
  maxPrice: Infinity,
  query: "",
};
const filter = (overrides = {}, sort = "featured", source = products) =>
  filterCatalogue(source, { ...resetFilters, ...overrides }, sort);
const ids = (items) => items.map((product) => product.id);

test("all 17 real products are returned in featured order on reset", () => {
  const result = filter();
  assert.equal(result.length, 17);
  assert.deepEqual(result, products);
  assert.notStrictEqual(result, products);
});

test("all categories have the expected counts and source order", () => {
  assert.deepEqual(catalogue.categories, ["saree", "dress", "lehenga", "menswear"]);
  const expected = { saree: 4, dress: 4, lehenga: 4, menswear: 5 };
  for (const [category, count] of Object.entries(expected)) {
    const result = filter({ categories: [category] });
    assert.equal(result.length, count, category);
    assert.deepEqual(result, products.filter((product) => product.category === category));
  }
});

test("selections are OR within each group and AND across groups", () => {
  assert.equal(filter({ categories: ["saree", "menswear"] }).length, 9);
  assert.deepEqual(
    ids(filter({ garmentTypes: ["saree", "kurta-and-trousers-set"] })),
    ["KES-007", "KES-008", "KES-009", "KES-010", "KES-016", "KES-017"],
  );
  assert.deepEqual(
    ids(filter({
      categories: ["dress", "menswear"],
      garmentTypes: ["womenswear-set", "kurta-and-trousers-set", "saree"],
      minPrice: 12500,
      maxPrice: 36000,
      query: "SET",
    })),
    ["KES-006", "KES-016", "KES-017"],
  );
});

test("price bounds are inclusive and use base prices rather than options or add-ons", () => {
  assert.deepEqual(ids(filter({ minPrice: 36000, maxPrice: 36000 })), [
    "KES-005", "KES-006", "KES-012",
  ]);
  assert.deepEqual(
    ids(filter({ categories: ["saree"], minPrice: 31000, maxPrice: 41999 })),
    ["KES-007", "KES-010"],
  );
  assert.deepEqual(ids(filter({ minPrice: 130000, maxPrice: 130000 })), ["KES-001"]);
  assert.deepEqual(filter({ minPrice: 140000, maxPrice: 140000 }), []);
});

test("41999 boundary is exact on both sides", () => {
  assert.deepEqual(ids(filter({ minPrice: 41999, maxPrice: 41999 })), ["KES-010"]);
  assert.ok(!ids(filter({ maxPrice: 41998 })).includes("KES-010"));
  assert.ok(!ids(filter({ minPrice: 42000 })).includes("KES-010"));
  assert.ok(ids(filter({ maxPrice: 41999 })).includes("KES-010"));
  assert.ok(ids(filter({ minPrice: 41999 })).includes("KES-010"));
});

test("queries match name, category, and human-readable garment type substrings", () => {
  assert.deepEqual(ids(filter({ query: "  VaSuDh  " })), ["KES-010"]);
  assert.deepEqual(ids(filter({ query: "MENSWEAR" })), [
    "KES-006", "KES-013", "KES-014", "KES-015", "KES-016", "KES-017",
  ]);
  assert.deepEqual(ids(filter({ query: "SKIRT JACKET" })), ["KES-011"]);
  assert.deepEqual(ids(filter({ query: "indo-western" })), ["KES-014"]);
  assert.deepEqual(ids(filter({ query: "  INDO   WESTERN  " })), ["KES-014"]);
  assert.deepEqual(ids(filter({ query: "dress-with dupatta" })), ["KES-005"]);
  assert.deepEqual(filter({ query: " \t\n " }), products);
});

test("category, garment, price, and search constraints all apply together", () => {
  const filters = {
    categories: ["menswear"],
    garmentTypes: ["kurta-and-trousers-set", "bundi-kurta-and-trousers-set"],
    minPrice: 12500,
    maxPrice: 40000,
    query: "kurta",
  };
  assert.deepEqual(ids(filter(filters)), ["KES-015", "KES-016", "KES-017"]);
  assert.deepEqual(ids(filter({ ...filters, query: "tamra" })), ["KES-017"]);
  assert.deepEqual(filter({ ...filters, categories: ["dress"] }), []);
});

test("all 11 garment types have readable labels and filter correctly", () => {
  const labels = {
    "bridal-lehenga-set": "Bridal Lehenga Set",
    "lehenga-set": "Lehenga Set",
    "dress-with-dupatta-and-churidaar": "Dress With Dupatta And Churidaar",
    "womenswear-set": "Womenswear Set",
    saree: "Saree",
    "skirt-jacket-and-bustier-set": "Skirt Jacket And Bustier Set",
    "cowl-dress-and-cape-set": "Cowl Dress And Cape Set",
    "sherwani-set": "Sherwani Set",
    "indo-western-set": "Indo Western Set",
    "bundi-kurta-and-trousers-set": "Bundi Kurta And Trousers Set",
    "kurta-and-trousers-set": "Kurta And Trousers Set",
  };
  assert.deepEqual(
    [...new Set(products.map((product) => product.garmentType))].sort(),
    Object.keys(labels).sort(),
  );
  for (const [garmentType, label] of Object.entries(labels)) {
    assert.equal(garmentLabel(garmentType), label);
    assert.deepEqual(
      filter({ garmentTypes: [garmentType] }),
      products.filter((product) => product.garmentType === garmentType),
    );
    assert.deepEqual(
      filter({ query: label }),
      products.filter((product) =>
        [product.name, product.category, product.garmentType].some((value) =>
          value.toLowerCase().replaceAll("-", " ").includes(label.toLowerCase()),
        ),
      ),
    );
  }
  assert.equal(garmentLabel("future-garment-style"), "Future Garment Style");
  assert.equal(garmentLabel(""), "");
});

test("sorting is correct, stable for equal prices, and does not mutate inputs", () => {
  const source = Object.freeze(products.map((product) => Object.freeze({ ...product })));
  const snapshot = structuredClone(source);
  const filters = Object.freeze({
    ...resetFilters,
    categories: Object.freeze([]),
    garmentTypes: Object.freeze([]),
  });
  for (const sort of ["featured", "price-asc", "price-desc", "name-asc"]) {
    const result = filterCatalogue(source, filters, sort);
    assert.notStrictEqual(result, source);
    assert.equal(result.length, 17);
    if (sort === "featured") assert.deepEqual(result, source);
    for (let index = 1; index < result.length; index += 1) {
      const previous = result[index - 1];
      const current = result[index];
      if (sort === "price-asc") assert.ok(previous.price <= current.price);
      if (sort === "price-desc") assert.ok(previous.price >= current.price);
      if (sort === "name-asc") assert.ok(previous.name.localeCompare(current.name) <= 0);
    }
    if (sort.startsWith("price-")) {
      assert.deepEqual(ids(result.filter((product) => product.price === 36000)), [
        "KES-005", "KES-006", "KES-012",
      ]);
    }
  }
  assert.deepEqual(source, snapshot);
  assert.deepEqual(filters, resetFilters);
  assert.deepEqual(ids(filter({}, "price-asc")).slice(0, 2), ["KES-016", "KES-017"]);
  assert.equal(filter({}, "price-desc")[0].id, "KES-001");
  assert.equal(filter({}, "name-asc")[0].id, "KES-014");
});

test("empty inputs, unmatched filters, and inverted bounds return no results; reset restores all", () => {
  assert.deepEqual(filter({}, "featured", []), []);
  assert.deepEqual(filter({ query: "not a real product" }), []);
  assert.deepEqual(filter({ categories: ["unknown"] }), []);
  assert.deepEqual(filter({ garmentTypes: ["unknown"] }), []);
  assert.deepEqual(filter({ minPrice: 50000, maxPrice: 10000 }), []);
  assert.deepEqual(filter(), products);
});
