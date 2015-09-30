(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this || (typeof window !== 'undefined' && window), function () { 'use strict';

	function foo () {
		return 42;
	}

	console.log( foo() );

}));
