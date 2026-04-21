import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Loaded as a side effect. Must be the first import in src/index.ts so env
// vars are populated before any module (e.g. r2.ts) reads process.env at its
// top level. ESM evaluates child modules fully before the next sibling import.
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });
