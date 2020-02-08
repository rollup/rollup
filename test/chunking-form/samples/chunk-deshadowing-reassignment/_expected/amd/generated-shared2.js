define(['exports', './generated-dep1', './generated-dep2'], function (exports, dep1, dep2) { 'use strict';

	var x = dep1.x + 1;
	console.log('shared1');

	var y = dep2.x + 1;
	console.log('shared2');

	exports.x = x;
	exports.y = y;

});
