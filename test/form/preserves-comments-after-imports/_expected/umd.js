(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory((global.myBundle = {}));
}(this || (typeof window !== 'undefined' && window), function (exports) { 'use strict';

	/** A comment for a number */
	var number = 5;

	/** A comment for obj */
	var obj = { number };

	exports.obj = obj;

}));
