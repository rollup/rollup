define(['require', 'exports'], function (require, exports) { 'use strict';

	const value = 'shared';

	console.log('a', value);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	console.log('main', value);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });

	exports.value = value;

	Object.defineProperty(exports, '__esModule', { value: true });

});
