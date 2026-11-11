import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const [template, page] = await Promise.all([
  readFile(join(root, "worker.template.js"), "utf8"),
  readFile(join(root, "index.html"), "utf8"),
]);

const marker = "const PAGE = __PAGE_CONTENT__;";
if (!template.includes(marker)) {
  throw new Error("Worker template is missing the page marker.");
}

const output = template.replace(marker, "const PAGE = " + JSON.stringify(page) + ";");
const dist = join(root, "dist");
await mkdir(dist, { recursive: true });
await writeFile(join(dist, "worker.js"), output, "utf8");
process.stdout.write("Собран dist/worker.js\n");
