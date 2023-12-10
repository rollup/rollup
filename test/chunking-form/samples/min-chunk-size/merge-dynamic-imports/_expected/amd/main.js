define(['exports'], (function (exports) { 'use strict';

	const big =
		'1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

	const small1$2 = Promise.resolve().then(function () { return small1$1; });
	const small2$2 = Promise.resolve().then(function () { return small2$1; });

	const small1 = 'small1';

	var small1$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		small1: small1
	});

	const small2 = 'small2';

	var small2$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		small2: small2
	});

	exports.big = big;
	exports.small1 = small1$2;
	exports.small2 = small2$2;

}));
