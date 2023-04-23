define(['exports'], (function (exports) { 'use strict';

	const bar = 2;
	Promise.resolve().then(function () { return foo; });

	var foo = /*#__PURE__*/Object.freeze({
		__proto__: null
	});

	exports.bar = bar;

}));
