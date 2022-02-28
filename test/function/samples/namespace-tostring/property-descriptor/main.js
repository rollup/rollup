import * as ns from './foo.js';

const { assign, getOwnPropertyDescriptor } = Object;

const { configurable, enumerable, value, writable } = getOwnPropertyDescriptor(
	ns,
	Symbol.toStringTag
);

assert.strictEqual(value, 'Module', 'value');
assert.strictEqual(configurable, false, 'configurable');
assert.strictEqual(enumerable, false, 'enumerable');
assert.strictEqual(writable, false, 'writable');

const a = assign({}, ns);
const b = { ...ns };

assert.deepStrictEqual(a, { foo: 'bar' });
assert.strictEqual(a[Symbol.toStringTag], undefined);

assert.deepStrictEqual(b, { foo: 'bar' });
assert.strictEqual(b[Symbol.toStringTag], undefined);
