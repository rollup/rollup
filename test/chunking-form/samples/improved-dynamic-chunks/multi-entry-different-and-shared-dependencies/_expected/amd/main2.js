define(['require', 'exports', './generated-from-main-1-and-2'], (function (require, exports, fromMain1And2) { 'use strict';

	console.log('main2', fromMain1And2.value2, fromMain1And2.value3);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); });

	exports.value2 = fromMain1And2.value2;
	exports.value3 = fromMain1And2.value3;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
