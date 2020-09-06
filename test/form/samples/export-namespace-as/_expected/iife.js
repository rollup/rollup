var bundle = (function (exports) {
	'use strict';

	const foo = 'foo1';
	const bar = 'bar1';

	var dep = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		foo: foo,
		bar: bar
	}, '__esModule', { value: true }));

	exports.dep = dep;

	return exports;

}({}));
