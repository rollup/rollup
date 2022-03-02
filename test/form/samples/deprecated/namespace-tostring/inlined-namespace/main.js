import * as foo from './foo';

assert.strictEqual(foo[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(foo), '[object Module]');
assert.strictEqual(foo.bar, 42);
