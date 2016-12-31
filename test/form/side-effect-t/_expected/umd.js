(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myBundle = global.myBundle || {})));
}(this, (function (exports) { 'use strict';

	function x () {
		return new Promise( ( resolve, reject ) => {
			console.log( 'this is a side-effect' );
			resolve();
		});
	}

	x();

	function promiseCallback ( resolve, reject ) {
		console.log( 'this is a side-effect' );
		resolve();
	}

	function y () {
		return new Promise( promiseCallback );
	}

	y();

	function z ( x ) {
		// this function has no side-effects, so should be excluded...
	}

	exports.a = 1;
	z( exports.a += 1 ); // ...unless the call expression statement has its own side-effects

	Object.defineProperty(exports, '__esModule', { value: true });

})));
