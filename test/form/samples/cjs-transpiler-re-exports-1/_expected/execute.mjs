import assert from "node:assert";
import { foo, __proto__ } from "./cjs.js";
assert.strictEqual(foo, 1);
assert.strictEqual(__proto__, undefined);