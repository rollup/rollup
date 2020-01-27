define(['require', 'exports', './generated-separate'], function (require, exports, separate$1) { 'use strict';

	var inlined = 'inlined';
	const x = 1;

	var inlined$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': inlined,
		x: x
	});

	const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
	const separate = new Promise(function (resolve, reject) { require(['./generated-separate'], resolve, reject) });

	exports.inlined = inlined$2;
	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
