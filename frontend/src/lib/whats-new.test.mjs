import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveWhatsNewPieceLink as pieceLink, resolveWhatsNewSilhouetteLink as silhouetteLink } from "./lookbook-links.ts";
import { SEASON_ARRIVALS } from "./whats-new.ts";

const { products } = JSON.parse(await readFile(new URL("./lookbook-products.json", import.meta.url), "utf8"));
const gallerySource = await readFile(new URL("./lookbook.ts", import.meta.url), "utf8");
const galleries = new Map([...gallerySource.matchAll(/"(KES-\d+)":\s*\[([\s\S]*?)\]/g)]
  .map(([, id, body]) => [id, [...body.matchAll(/"([^"]+\.jpg)"/g)].map((match) => match[1])]));
const resolve = (image, link = "#", name = "Unrelated legacy name") => pieceLink({ image, link, name });

test("client photo projection agrees with every verified lookbook gallery and catalogue cover", () => {
  assert.equal(galleries.size, 17);
  for (const product of products) {
    for (const image of [product.image, ...galleries.get(product.id)]) {
      assert.equal(resolve(image), `/product_detail/${product.id}`, image);
    }
    assert.equal(resolve("", `/product/${product.slug}`), `/product_detail/${product.id}`);
    assert.equal(resolve("", "#", product.name), `/product_detail/${product.id}`);
  }
});

test("all nine defaults resolve safely, with real source names for individual pieces", () => {
  const expected = ["KES-003", "KES-009", "KES-005", "KES-002", "KES-017", null, null, null, "KES-003"];
  assert.equal(SEASON_ARRIVALS.length, expected.length);
  SEASON_ARRIVALS.forEach((arrival, index) => {
    const id = expected[index];
    assert.equal(pieceLink({ ...arrival, link: `/product/${arrival.slug}` }), id ? `/product_detail/${id}` : "/products");
    if (id) {
      const product = products.find((entry) => entry.id === id);
      assert.equal(arrival.name, product.name);
      assert.equal(arrival.category, product.category);
    }
  });
});

test("CMS-published old defaults resolve by photograph, not their unrelated product slug/name", () => {
  const legacySlugs = ["soft-ivory-kurta", "forest-ari-lehenga", "ivory-pitta-waistcoat", "saffron-resham-kurta", "violet-cutdana-blouse", "brocade-evening-jacket", "ice-veil-sequin", "mirror-veil-border", "elephant-zardozi-panel"];
  SEASON_ARRIVALS.forEach((arrival, index) => {
    assert.equal(resolve(arrival.image, `/product/${legacySlugs[index]}`, "Ice Veil Sequin"), pieceLink({ ...arrival, link: `/product/${arrival.slug}` }));
  });
  assert.equal(resolve("/images/OFF%20WHITE/DSC07237.jpg?width=800"), "/product_detail/KES-005");
  assert.equal(resolve("/images/ORANGE/DSC07568.jpg", "/product/rajsi-lehenga"), "/product_detail/KES-017");
});

test("multi-garment photographs never become a single product, even with a catalogue name", () => {
  for (const image of ["/images/PINK/DSC06150.jpg", "/images/soft-bridal/insight-3.jpg", "/images/Wedding/DSC05328.jpg"]) {
    assert.equal(resolve(image, "#", "Maharani Lehenga"), "/products");
  }
});

test("custom/external, story, craft, contact and modern product destinations are preserved", () => {
  const image = "/images/ORANGE/DSC07568.jpg";
  for (const link of ["https://example.com/shop", "//example.com/shop", "/atelier", "/craft/deep-plum", "/world-of-kesari", "/contact", "mailto:atelier@example.com", "tel:+911234567890", "#appointment", "/products", "/products?category=saree", "/product/custom-commission", "/product_detail/KES-001", "/product/soft-ivory-kurta?appointment=1"]) {
    assert.equal(resolve(image, link), link);
  }
});

test("unknown images, remote lookalikes and unknown slugs are not guessed by folder or basename", () => {
  for (const image of ["/images/ORANGE/unverified.jpg", "https://example.com/images/ORANGE/DSC07568.jpg", "/images/OFF%broken.jpg"]) {
    assert.equal(resolve(image, "/product/forest-ari-lehenga"), "/product/forest-ari-lehenga");
    assert.equal(resolve(image, ""), "/products");
  }
  assert.equal(resolve("", "/product/ice-veil-sequin"), "/product_detail/KES-012");
});

test("clear silhouette defaults use catalogue categories and intentional destinations stay intact", () => {
  for (const [label, category] of [["Sarees", "saree"], ["Lehengas", "lehenga"], ["Dresses", "dress"]]) {
    for (const link of ["", "#", `/womenswear?category=${category}`]) {
      assert.equal(silhouetteLink({ label, link }), `/products?category=${category}`);
    }
    for (const link of ["https://example.com", "/contact", "/womenswear?category=dress&occasion=wedding", "/products?category=saree"]) {
      assert.equal(silhouetteLink({ label, link }), link);
    }
  }
  assert.equal(silhouetteLink({ label: "Menswear", link: "#" }), "/products?category=menswear");
  assert.equal(silhouetteLink({ label: "Custom Edit", link: "/atelier" }), "/atelier");
});

test("both arcade actions consume the same server-resolved piece link", async () => {
  // Links are remapped in whats-new/page.tsx (CMS over lookbook); the arcade must not re-resolve.
  const arcade = await readFile(new URL("../components/whats-new/ArchArcade.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/whats-new/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(arcade, /resolveWhatsNewPieceLink/);
  assert.match(arcade, /href=\{piece\.link \|\| "#"\}/);
  assert.match(arcade, /<MagneticLink href=\{piece\.link \|\| "#"\}/);
  assert.match(page, /links\.forPiece/);
});
