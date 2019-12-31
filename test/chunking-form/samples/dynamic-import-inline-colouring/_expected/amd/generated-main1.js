define(['exports'], function (exports) { 'use strict';

	var inlined = 'inlined';
	const x = 1;

	var inlined$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': inlined,
		x: x
	});

	var separate = 'separate';
	const x$1 = 2;

	var separate$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': separate,
		x: x$1
	});

	const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
	const separate$2 = Promise.resolve().then(function () { return separate$1; });

	exports.inlined = inlined$2;
	exports.separate = separate;
	exports.separate$1 = separate$2;
	exports.x = x$1;

});
