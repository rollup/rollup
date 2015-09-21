(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.foo = factory();
}(this || (typeof window !== 'undefined' && window), function () { 'use strict';

	function foo () {
		console.log( 'indented with tabs' );
	}

	return foo;

}));
