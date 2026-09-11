define(['exports'], (function (exports) { 'use strict';

	const foo = 'foo1';
	const bar = 'bar1';

	var dep = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
		bar: bar,
		foo: foo
	}, null));

	exports.dep = dep;

}));
