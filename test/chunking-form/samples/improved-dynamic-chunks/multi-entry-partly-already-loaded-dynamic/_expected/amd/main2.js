define(['require', 'exports', './generated-dep2'], (function (require, exports, dep2) { 'use strict';

	console.log('main2', dep2.value2);
	new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject); });

	exports.value2 = dep2.value2;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
