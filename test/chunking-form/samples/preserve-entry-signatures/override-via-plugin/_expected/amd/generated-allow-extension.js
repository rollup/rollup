define(['require', 'exports'], (function (require, exports) { 'use strict';

	const shared = 'shared';

	console.log(shared);
	new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject); });
	const unused = 42;

	exports.shared = shared;
	exports.unused = unused;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
