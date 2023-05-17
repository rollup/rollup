define(['exports', './main3', './main4'], (function (exports, main3, main4) { 'use strict';

	var x = main3.x + 1;
	console.log('shared1');

	var y = main4.x + 1;
	console.log('shared2');

	exports.x = x;
	exports.y = y;

}));
