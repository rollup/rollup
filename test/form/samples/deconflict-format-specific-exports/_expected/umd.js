(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.bundle = {}));
}(this, (function (exports) { 'use strict';

	const exports$1 = {
		x: 42
	};
	console.log(exports$1);

	function nestedConflict() {
		const exports$1 = {
			x: 42
		};
		console.log(exports$1);
		exports.x++;
	}

	function nestedNoConflict() {
		const exports = {
			x: 42
		};
		console.log(exports);
	}

	exports.x = 43;
	nestedConflict();
	nestedNoConflict();

	Object.defineProperty(exports, '__esModule', { value: true });

})));
