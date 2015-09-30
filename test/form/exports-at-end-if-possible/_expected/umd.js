(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory((global.myBundle = {}));
}(this || (typeof window !== 'undefined' && window), function (exports) { 'use strict';

	var FOO = 'foo';

	console.log( FOO );
	console.log( FOO );
	console.log( FOO );

	exports.FOO = FOO;

}));
