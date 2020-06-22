define(['exports', './hsl2hsv', './generated-index'], function (exports, hsl2hsv, index) { 'use strict';

	console.log(hsl2hsv.p);
	var main = new Map(Object.entries(index.lib));

	exports.default = main;

	Object.defineProperty(exports, '__esModule', { value: true });

});
