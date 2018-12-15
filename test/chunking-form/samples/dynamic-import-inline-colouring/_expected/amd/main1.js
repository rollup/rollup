define(['require', 'exports', './generated-chunk.js', './generated-chunk2.js'], function (require, exports, inlined_js, separate_js) { 'use strict';

	const inlined = new Promise(function (resolve, reject) { require(['./generated-chunk.js'], resolve, reject) });
	const separate = new Promise(function (resolve, reject) { require(['./generated-chunk2.js'], resolve, reject) });

	exports.inlined = inlined;
	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
