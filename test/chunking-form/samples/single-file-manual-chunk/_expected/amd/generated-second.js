define(['exports'], (function (exports) { 'use strict';

	console.log('b');

	var b = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));

	console.log('c');

	var c = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));

	exports.b = b;
	exports.c = c;

}));
