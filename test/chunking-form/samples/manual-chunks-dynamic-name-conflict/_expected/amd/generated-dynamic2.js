define(['exports'], function (exports) { 'use strict';

	console.log('dynamic2');

	const DYNAMIC_A = 'DYNAMIC_A';
	const DYNAMIC_B = 'DYNAMIC_B';

	console.log('dynamic1');

	exports.DYNAMIC_A = DYNAMIC_A;
	exports.DYNAMIC_B = DYNAMIC_B;

});
