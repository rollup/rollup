define(['exports'], (function (exports) { 'use strict';

	console.log('dynamic2');

	const DYNAMIC_A = 'DYNAMIC_A';
	const DYNAMIC_B = 'DYNAMIC_B';

	var dynamic2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		DYNAMIC_A: DYNAMIC_A,
		DYNAMIC_B: DYNAMIC_B
	});

	console.log('dynamic1');

	var dynamic1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		DYNAMIC_B: DYNAMIC_A,
		DYNAMIC_A: DYNAMIC_B
	});

	exports.dynamic1 = dynamic1;
	exports.dynamic2 = dynamic2;

}));
