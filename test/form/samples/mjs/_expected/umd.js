(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.myBundle = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

	var dep = 'js';

	var dep$1 = 'mjs';

	exports.depJs = dep;
	exports.depMjs = dep$1;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
