define(['require', 'exports', './generated-chunk', './generated-chunk2'], function (require, exports, inlined_js, separate_js) { 'use strict';

	const inlined = new Promise(function (resolve, reject) { require(['./generated-chunk'], resolve, reject) });
	const separate = new Promise(function (resolve, reject) { require(['./generated-chunk2'], resolve, reject) });

	exports.inlined = inlined;
	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
