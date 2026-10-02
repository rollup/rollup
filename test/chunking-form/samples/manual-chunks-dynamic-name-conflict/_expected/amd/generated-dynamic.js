define(['exports', './generated-dynamic2'], (function (exports, dynamic2) { 'use strict';

	console.log('dynamic1');

	exports.DYNAMIC_A = dynamic2.DYNAMIC_B;
	exports.DYNAMIC_B = dynamic2.DYNAMIC_A;

}));
