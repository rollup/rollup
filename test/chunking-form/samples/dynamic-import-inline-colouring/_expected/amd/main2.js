define(['require', 'exports'], function (require, exports) { 'use strict';

	const separate = new Promise(function (resolve, reject) { require(['./generated-chunk2.js'], resolve, reject) });

	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
