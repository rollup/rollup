define(['require', 'exports', './generated-separate'], (function (require, exports, separate$1) { 'use strict';

	var inlined$1 = 'inlined';
	const x = 1;
	console.log('inlined');

	var inlined$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		default: inlined$1,
		x: x
	});

	const inlined = Promise.resolve().then(function () { return inlined$2; });
	const separate = new Promise(function (resolve, reject) { require(['./generated-separate'], resolve, reject); });

	exports.inlined = inlined;
	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
