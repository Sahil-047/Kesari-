// Writes public/3d model/manifest.json with the byte size of every .glb.
// The hero uses it for real loading progress: servers often gzip/stream the
// models without a Content-Length, so the browser can't know the total itself.
// Runs automatically before `dev` and `build` (see package.json).
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "public", "3d model");
const sizes = {};
for (const file of readdirSync(dir)) {
  if (file.endsWith(".glb")) sizes[file] = statSync(join(dir, file)).size;
}
writeFileSync(join(dir, "manifest.json"), JSON.stringify(sizes, null, 2) + "\n");
console.log("model manifest:", sizes);
