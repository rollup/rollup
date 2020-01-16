define(['require', 'exports', './generated-dep2'], function (require, exports, dep2) { 'use strict';

	// doesn't import value1, so we can't have also loaded value1?
	console.log('main2', dep2.value2);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	exports.value2 = dep2.value2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
