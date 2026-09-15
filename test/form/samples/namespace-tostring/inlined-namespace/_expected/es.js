const bar = 42;

var foo = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar
}, null), Symbol.toStringTag, { value: 'Module' }));

assert.strictEqual(foo[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(foo), '[object Module]');
assert.strictEqual(bar, 42);
