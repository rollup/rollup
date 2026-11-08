import * as ns from './dep.js';
import { mutable } from './dep.js';

ns.mutable = 2;
assert.strictEqual(mutable, 1);

assert.strictEqual(delete ns.mutable, true);
assert.strictEqual(mutable, 1);
