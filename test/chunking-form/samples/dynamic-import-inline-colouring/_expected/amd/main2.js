define(['require', 'exports'], function (require, exports) { 'use strict';

	const separate = new Promise(function (resolve, reject) { require(['./generated-separate'], resolve, reject) });

	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
