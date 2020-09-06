define(['exports'], function (exports) { 'use strict';

	const foo = 'foo';

	var volume = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		foo: foo
	}, '__esModule', { value: true }));

	const bar = 'bar';

	var geometry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		bar: bar
	}, '__esModule', { value: true }));

	exports.bar = bar;
	exports.foo = foo;
	exports.geometry = geometry;
	exports.volume = volume;

});
