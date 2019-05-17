define(['require', 'exports', './generated-inlined', './generated-separate'], function (require, exports, inlined$1, separate$1) { 'use strict';

	const inlined = new Promise(function (resolve, reject) { require(['./generated-inlined'], resolve, reject) });
	const separate = new Promise(function (resolve, reject) { require(['./generated-separate'], resolve, reject) });

	exports.inlined = inlined;
	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
