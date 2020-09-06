define(['exports'], function (exports) { 'use strict';

	const foo = 1;
	const bar = 2;

	var namespace = /*#__PURE__*/Object.defineProperty({
		__proto__: null,
		foo: foo,
		bar: bar
	}, '__esModule', { value: true });

	console.log( Object.keys( namespace ) );

	const a = 1;
	const b = 2;

	exports.a = a;
	exports.b = b;

	Object.defineProperty(exports, '__esModule', { value: true });

});
