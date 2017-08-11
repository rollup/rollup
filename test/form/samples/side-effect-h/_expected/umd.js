(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.myBundle = factory());
}(this, (function () { 'use strict';

	function foo ( ok ) {
		if ( !ok ) {
			throw new Error( 'this will be ignored' );
		}
	}

	foo();

	var main = 42;

	return main;

})));
