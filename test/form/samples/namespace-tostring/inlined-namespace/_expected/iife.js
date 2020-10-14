(function () {
	'use strict';

	const bar = 42;

	var foo = /*#__PURE__*/Object.freeze({
		__proto__: null,
		[Symbol.toStringTag]: 'Module',
		bar: bar
	});

	assert.strictEqual(foo[Symbol.toStringTag], 'Module');
	assert.strictEqual(Object.prototype.toString.call(foo), '[object Module]');
	assert.strictEqual(bar, 42);

}());
