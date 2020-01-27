define(['require', 'exports', './generated-dep1', './generated-dep2'], function (require, exports, dep1, dep2) { 'use strict';

	const something = 'something';

	console.log('main1', dep1.value1, dep2.value2, something);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	exports.value1 = dep1.value1;
	exports.value2 = dep2.value2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
