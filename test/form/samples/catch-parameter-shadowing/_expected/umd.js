(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.bundle = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

	const e = 2.7182818284;

	function something () {
		try {
			console.log( e );
		} catch ( e$$1 ) { // the catch identifier shadows the import
			console.error( e$$1 );
		}
	}

	exports.something = something;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
