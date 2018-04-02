(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function a () {
		foo();
		foo();

		var a;
		if ( a.b ) {
			// empty
		}
	}

	a();

})));
