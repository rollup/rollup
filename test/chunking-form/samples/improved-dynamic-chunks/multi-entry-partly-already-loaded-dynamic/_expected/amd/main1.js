define(['require', 'exports', './generated-dep2'], (function (require, exports, dep2) { 'use strict';

	const value1 = 'shared1';

	console.log('main1', value1, dep2.value2);
	new Promise(function (resolve, reject) { require(['./generated-dynamic1'], resolve, reject); });

	exports.value2 = dep2.value2;
	exports.value1 = value1;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
