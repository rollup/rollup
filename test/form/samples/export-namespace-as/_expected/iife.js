var bundle = (function (exports) {
	'use strict';

	const foo = 'foo1';
	const bar = 'bar1';

	var dep = /*#__PURE__*/Object.freeze({
		__proto__: null,
		foo: foo,
		bar: bar
	});

	exports.dep = dep;

	return exports;

}({}));
