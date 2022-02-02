import * as ns from './foo.js';

const { configurable, enumerable, value, writable } = Object.getOwnPropertyDescriptor(
	ns,
	Symbol.toStringTag
);

assert.strictEqual(value, 'Module', 'value');
assert.strictEqual(configurable, false, 'configurable');
assert.strictEqual(enumerable, false, 'enumerable');
assert.strictEqual(writable, false, 'writable');
