import type { LookbookProduct } from "@/lib/lookbook";

export type CatalogueProduct = Pick<
  LookbookProduct,
  "id" | "name" | "category" | "garmentType" | "price" | "image"
> & {
  /** Product page; lookbook pieces default to /product_detail/<id>. */
  href?: string;
};

export type CatalogueFilters = {
  categories: string[];
  garmentTypes: string[];
  minPrice: number;
  maxPrice: number;
  query: string;
};

export type CatalogueSort = "featured" | "price-asc" | "price-desc" | "name-asc";

function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/[-\s]+/g, " ").trim();
}

export function garmentLabel(value: string): string {
  return normalizeSearch(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function filterCatalogue(
  products: readonly CatalogueProduct[],
  filters: CatalogueFilters,
  sort: CatalogueSort,
): CatalogueProduct[] {
  const query = normalizeSearch(filters.query);
  const result = products.filter(
    (product) =>
      (filters.categories.length === 0 || filters.categories.includes(product.category)) &&
      (filters.garmentTypes.length === 0 || filters.garmentTypes.includes(product.garmentType)) &&
      product.price >= filters.minPrice &&
      product.price <= filters.maxPrice &&
      (!query ||
        [product.name, product.category, product.garmentType].some((value) =>
          normalizeSearch(value).includes(query),
        )),
  );

  switch (sort) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "name-asc":
      return result.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
      return result;
  }
}
