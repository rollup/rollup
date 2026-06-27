var myBundle = (function (exports) {
	'use strict';

	const foo = 1;
	const bar = 2;

	var namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
		bar: bar,
		foo: foo
	}, null));

	console.log( Object.keys( namespace ) );

	const a = 1;
	const b = 2;

	exports.a = a;
	exports.b = b;

	return exports;

})({});
