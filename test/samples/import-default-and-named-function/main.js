import foo, { callsFoo } from './foo';

assert.strictEqual(foo(), 1);
assert.strictEqual(callsFoo(), 1);
