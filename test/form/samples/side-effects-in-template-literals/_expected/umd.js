(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.myBundle = {}));
}(this, function (exports) { 'use strict';

	exports.x = 0;

	function noEffects () {}

	function modifyX () {
		return exports.x++;
	}

	const b = `${globalFunction()}has effects`;

	const c = `${modifyX()}has effects`;

	const e = noEffects`${globalFunction()}has effects`;

	const f = noEffects`${modifyX()}has effects`;

	const g = globalFunction`has effects`;

	const h = (() => {
		console.log( 'effect' );
		return () => {};
	})()`has effects`;

	const i = modifyX`has effects`;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
