define(['exports', './generated-dep1', './generated-dep2'], (function (exports, dep1, dep2) { 'use strict';

	console.log('dynamic1', dep1.value1, dep2.value2);

	exports.value1 = dep1.value1;
	exports.value2 = dep2.value2;

}));
