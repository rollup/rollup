(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function foo$1 () {
		console.log( 'foo' );
	}

	function a () {
		foo$1();
		foo$1();

		var a;
		if ( a.b ) {
			// empty
		}
	}

	a();

})));