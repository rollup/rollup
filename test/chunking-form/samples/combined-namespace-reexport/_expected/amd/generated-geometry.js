define(['exports'], (function (exports) { 'use strict';

	const foo = 'foo';

	var volume = /*#__PURE__*/Object.freeze({
		__proto__: null,
		foo: foo
	});

	const bar = 'bar';

	var geometry = /*#__PURE__*/Object.freeze({
		__proto__: null,
		bar: bar
	});

	exports.bar = bar;
	exports.foo = foo;
	exports.geometry = geometry;
	exports.volume = volume;

}));
