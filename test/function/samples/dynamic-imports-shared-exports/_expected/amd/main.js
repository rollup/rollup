define(['require', 'exports'], (function (require, exports) { 'use strict';

	const shared = true;

	new Promise(function (resolve, reject) { require(['./generated-dynamic1'], resolve, reject); }).then(function (n) { return n.dynamic1; });
	console.log(shared);

	exports.shared = shared;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
