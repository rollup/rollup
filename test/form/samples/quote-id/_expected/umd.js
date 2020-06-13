(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('quoted\'external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'quoted\'external'], factory) :
	(global = global || self, factory(global.Q = {}, global.quotedExternal));
}(this, (function (exports, quoted_external) { 'use strict';

	Object.keys(quoted_external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return quoted_external[k];
			}
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

})));
