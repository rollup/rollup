define(['require', 'exports', './chunk-a2558f00.js'], function (require, exports, separate_js) { 'use strict';

	var inlined = 'inlined';
	const x = 1;

	var inlined$1 = /*#__PURE__*/Object.freeze({
		default: inlined,
		x: x
	});

	const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
	const separate = new Promise(function (resolve, reject) { require(["./chunk-a2558f00.js"], resolve, reject) });

	exports.inlined = inlined$2;
	exports.separate = separate;

	Object.defineProperty(exports, '__esModule', { value: true });

});
