(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.myBundle = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

	var FOO = 'foo';

	console.log( FOO );
	console.log( FOO );
	console.log( FOO );

	exports.FOO = FOO;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
