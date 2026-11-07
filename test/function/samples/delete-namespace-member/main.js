import * as namespace from './values.js';

assert.throws(() => delete namespace.value, TypeError);
assert.throws(() => delete namespace['value'], TypeError);
assert.throws(() => delete namespace?.value, TypeError);
assert.strictEqual(delete namespace.missing, true);
assert.strictEqual(delete namespace.object.property, true);
assert.deepStrictEqual(namespace.object, {});
