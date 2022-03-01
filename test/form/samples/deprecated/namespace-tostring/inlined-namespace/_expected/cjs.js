'use strict';

const bar = 42;

var foo = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	bar: bar
}, Symbol.toStringTag, { value: 'Module' }));

assert.strictEqual(foo[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(foo), '[object Module]');
assert.strictEqual(bar, 42);
