(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.myBundle = factory());
})(this, (function () { 'use strict';

	function foo ( ok ) {
		if ( !ok ) {
			throw new Error( 'this will be ignored' );
		}
	}

	foo();
	foo(true);

	var main = 42;

	return main;

}));
