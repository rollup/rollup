define(['require', 'exports'], (function (require, exports) { 'use strict';

	const value = 'shared';

	console.log('dynamic1', value);
	new Promise(function (resolve, reject) { require(['./generated-dynamic1'], resolve, reject); });

	exports.value = value;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
