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

assert.deepEqual(assign({}, ns), { foo: 'bar' });
assert.deepEqual({ ...ns }, { foo: 'bar' });
