define(['exports', './generated-index', './hsl2hsv'], (function (exports, index, hsl2hsv) { 'use strict';

	console.log(hsl2hsv.p);
	var main = new Map(Object.entries(index.lib));

	exports["default"] = main;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
